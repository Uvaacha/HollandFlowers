package com.flowerapp.hebasePayment.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowerapp.common.enums.DeliveryStatus;
import com.flowerapp.hebasePayment.config.HesabeConfig;
import com.flowerapp.hebasePayment.domain.PaymentMethod;
import com.flowerapp.hebasePayment.domain.PaymentStatus;
import com.flowerapp.hebasePayment.dto.HesabeCheckoutRequest;
import com.flowerapp.hebasePayment.dto.HesabeCheckoutResponse;
import com.flowerapp.hebasePayment.dto.HesabePaymentResponse;
import com.flowerapp.hebasePayment.exception.PaymentException;
import com.flowerapp.hebasePayment.model.Payment;
import com.flowerapp.hebasePayment.model.PaymentOrder;
import com.flowerapp.hebasePayment.repository.PaymentOrderRepository;
import com.flowerapp.hebasePayment.repository.PaymentRepository;
import com.flowerapp.hebasePayment.service.HesabePaymentService;
import com.flowerapp.notification.service.EmailService;
import com.flowerapp.order.entity.Order;
import com.flowerapp.order.repository.OrderRepository;
import com.flowerapp.user.entity.User;
import com.flowerapp.hebasePayment.request.InitiatePaymentRequest;
import com.flowerapp.hebasePayment.response.PaymentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class HesabePaymentServiceImpl implements HesabePaymentService {

    private final HesabeConfig hesabeConfig;
    private final PaymentRepository paymentRepository;
    private final PaymentOrderRepository paymentOrderRepository;
    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final EmailService emailService;

    private static final String AES_ALGORITHM = "AES/CBC/PKCS5Padding";

    @Transactional
    @Override
    public PaymentResponse initiatePayment(InitiatePaymentRequest request, User user) throws Exception {
        log.info("Initiating payment for user: {}, method: {}", user.getEmail(), request.getPaymentMethod());

        // Get order
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new PaymentException("Order not found"));

        // Validate order belongs to user
        if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new PaymentException("Order does not belong to user");
        }

        // Check if order is already paid
        if (order.getPaymentStatus() == PaymentStatus.COMPLETED) {
            throw new PaymentException("Order is already paid");
        }

        // Calculate amount (convert KWD to fils - 1 KWD = 1000 fils)
        Double amountKwd = order.getTotalAmount().doubleValue();
        Long amountFils = Math.round(amountKwd * 1000);

        // Generate unique payment reference
        String paymentReference = generatePaymentReference();

        // Create payment record
        Payment payment = Payment.builder()
                .paymentReference(paymentReference)
                .order(order)
                .user(user)
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.PENDING)
                .amount(amountKwd)
                .amountInFils(amountFils)
                .currency("KWD")
                .customerEmail(request.getCustomerEmail() != null ? request.getCustomerEmail() : user.getEmail())
                .customerPhone(request.getCustomerPhone() != null ? request.getCustomerPhone() : user.getPhoneNumber())
                .createdAt(LocalDateTime.now())
                .build();

        // Handle Cash on Delivery separately
        if (request.getPaymentMethod() == PaymentMethod.CASH_ON_DELIVERY) {
            return handleCashOnDelivery(payment, order);
        }

        // Build Hesabe checkout request
        HesabeCheckoutRequest checkoutRequest = HesabeCheckoutRequest.builder()
                .merchantCode(hesabeConfig.getMerchantCode())
                .amount(amountFils)
                .paymentType(request.getPaymentMethod().getHesabeCode())
                .orderReferenceNumber(paymentReference)
                .responseUrl(hesabeConfig.getResponseUrl())
                .failureUrl(hesabeConfig.getFailureUrl())
                .version("2.0")
                .currency("KWD")
                .customerName(user.getName())
                .customerEmail(payment.getCustomerEmail())
                .customerMobile(payment.getCustomerPhone())
                .variable1(String.valueOf(order.getOrderId()))
                .variable2(String.valueOf(order.getOrderId()))
                .variable3(user.getUserId().toString())
                .orderDescription("Order #" + order.getOrderId())
                .build();

        // Encrypt request
        String encryptedRequest = encryptData(objectMapper.writeValueAsString(checkoutRequest));

        // Call Hesabe API
        HesabeCheckoutResponse hesabeResponse = callHesabeCheckoutApi(encryptedRequest);

        if (!hesabeResponse.isStatus()) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setErrorDetails(hesabeResponse.getMessage());
            paymentRepository.save(payment);

            return PaymentResponse.builder()
                    .success(false)
                    .message(hesabeResponse.getMessage())
                    .errorCode(hesabeResponse.getCode())
                    .errorMessage(hesabeResponse.getMessage())
                    .build();
        }

        // Update payment with Hesabe response
        payment.setHesabePaymentId(hesabeResponse.getResponse().getPaymentId());
        payment.setHesabeCheckoutToken(hesabeResponse.getResponse().getData());
        payment.setCheckoutUrl(hesabeResponse.getResponse().getCheckoutUrl());
        payment.setStatus(PaymentStatus.PROCESSING);
        paymentRepository.save(payment);

        // Update order payment status
        order.setPaymentStatus(PaymentStatus.PROCESSING);
        orderRepository.save(order);

        log.info("Payment initiated successfully. Reference: {}, Checkout URL: {}",
                paymentReference, payment.getCheckoutUrl());

        return PaymentResponse.builder()
                .success(true)
                .message("Payment initiated successfully")
                .paymentReference(paymentReference)
                .paymentId(payment.getHesabePaymentId())
                .checkoutUrl(payment.getCheckoutUrl())
                .paymentToken(payment.getHesabeCheckoutToken())
                .status(payment.getStatus())
                .paymentMethod(payment.getPaymentMethod())
                .amount(amountKwd)
                .currency("KWD")
                .orderId(order.getOrderId())
                .orderReference(String.valueOf(order.getOrderId()))
                .expiresAt(LocalDateTime.now().plusHours(1).format(DateTimeFormatter.ISO_DATE_TIME))
                .build();
    }

    @Override
    @Transactional
    public PaymentOrder createPaymentOrder(User user, Set<Order> orders, PaymentMethod paymentMethod) throws Exception {
        // Calculate total amount
        double totalAmount = orders.stream()
                .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount().abs().compareTo(new BigDecimal("")) : 0)
                .sum();

        PaymentOrder paymentOrder = new PaymentOrder();
        paymentOrder.setPaymentOrderReference(generatePaymentReference());
        paymentOrder.setAmount(Math.round(totalAmount * 1000)); // Convert to fils
        paymentOrder.setAmountKwd(totalAmount);
        paymentOrder.setCurrency("KWD");
        paymentOrder.setStatus(PaymentStatus.PENDING);
        paymentOrder.setPaymentMethod(paymentMethod);
        paymentOrder.setOrders(orders);
        paymentOrder.setUser(user);
        paymentOrder.setTotalItems(orders.stream()
                .mapToInt(order -> order.getOrderItems().size())
                .sum());
        return paymentOrderRepository.save(paymentOrder);
    }

    @Override
    @Transactional
    public Payment processPaymentCallback(String encryptedData) throws Exception {
        log.info("Processing payment callback");

        // Decrypt response
        String decryptedData = decryptData(encryptedData);
        HesabePaymentResponse response = objectMapper.readValue(decryptedData, HesabePaymentResponse.class);

        log.info("Payment callback - Reference: {}, Result: {}",
                response.getOrderReferenceNumber(), response.getResultCode());

        // Find payment by reference
        Payment payment = paymentRepository.findByPaymentReference(response.getOrderReferenceNumber())
                .orElseThrow(() -> new PaymentException("Payment not found for reference: " + response.getOrderReferenceNumber()));

        // Update payment with response data
        payment.setTransactionId(response.getTransactionId());
        payment.setAuthorizationCode(response.getAuthorizationCode());
        payment.setResultCode(response.getResultCode());
        payment.setResponseCode(response.getResultCode());
        payment.setResponseMessage(response.getResponseMessage());
        payment.setWebhookReceived(true);
        payment.setWebhookReceivedAt(LocalDateTime.now());

        // KNET specific fields
        if (response.getKnetPaymentId() != null) {
            payment.setKnetPaymentId(response.getKnetPaymentId());
            payment.setKnetTransactionId(response.getKnetTransactionId());
            payment.setKnetReferenceId(response.getKnetReferenceId());
            payment.setKnetResultCode(response.getKnetResultCode());
        }

        // Card specific fields
        if (response.getMaskedCardNumber() != null) {
            payment.setMaskedCardNumber(response.getMaskedCardNumber());
            payment.setCardBrand(response.getCardBrand());
            payment.setCardExpiryMonth(response.getCardExpiryMonth());
            payment.setCardExpiryYear(response.getCardExpiryYear());
        }

        // Update status based on result
        if (response.isSuccessful()) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setCompletedAt(LocalDateTime.now());

            // Update order status
            Order order = payment.getOrder();
            order.setPaymentStatus(PaymentStatus.COMPLETED);
            order.setDeliveryStatus(DeliveryStatus.CONFIRMED);
            orderRepository.save(order);

            log.info("Payment successful for reference: {}", payment.getPaymentReference());

            // ============ SEND EMAILS AFTER SUCCESSFUL PAYMENT ============

            // 1. Send order confirmation email to CUSTOMER
            try {
                emailService.sendOrderConfirmationEmail(
                        order.getUser().getEmail(),
                        order.getOrderNumber(),
                        "Total Amount: KWD " + order.getTotalAmount()
                );
                log.info("Order confirmation email sent for order: {}", order.getOrderNumber());
            } catch (Exception e) {
                log.error("Failed to send order confirmation email for order: {}", order.getOrderNumber(), e);
            }

            // 2. Send payment confirmation email to CUSTOMER
            try {
                emailService.sendPaymentConfirmationEmail(
                        order.getUser().getEmail(),
                        order.getOrderNumber(),
                        "KWD " + payment.getAmount()
                );
                log.info("Payment confirmation email sent for order: {}", order.getOrderNumber());
            } catch (Exception e) {
                log.error("Failed to send payment confirmation email for order: {}", order.getOrderNumber(), e);
            }

            // 3. SEND NEW ORDER NOTIFICATION TO SHOP OWNER
            try {
                // Build order items string for email
                StringBuilder itemsBuilder = new StringBuilder();
                if (order.getOrderItems() != null) {
                    for (var item : order.getOrderItems()) {
                        itemsBuilder.append(String.format(
                                "<div style='padding:10px;background:#f5f5f5;margin:5px 0;border-radius:5px;'>" +
                                        "<strong>%s</strong> × %d = KWD %.3f</div>",
                                item.getProduct().getProductName(),
                                item.getQuantity(),
                                item.getTotalPrice()
                        ));
                    }
                }

                emailService.sendNewOrderNotificationToOwner(
                        order.getOrderNumber(),
                        order.getUser() != null ? order.getUser().getName() : "Guest",
                        order.getUser() != null ? order.getUser().getEmail() : "-",
                        order.getUser() != null ? order.getUser().getPhoneNumber() : "-",
                        order.getRecipientName(),
                        order.getRecipientPhone(),
                        order.getDeliveryAddress(),
                        order.getDeliveryArea(),
                        order.getPreferredDeliveryDate() != null ? order.getPreferredDeliveryDate().toString() : null,
                        order.getCardMessage(),
                        order.getDeliveryNotes(),
                        itemsBuilder.toString(),
                        order.getTotalAmount().toString(),
                        payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : "Online"
                );
                log.info("Owner notification sent for new order: {}", order.getOrderNumber());
            } catch (Exception e) {
                log.error("Failed to send owner notification for order: {}", order.getOrderNumber(), e);
            }

        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setErrorDetails(response.getResponseMessage());

            // Update order status
            Order order = payment.getOrder();
            order.setPaymentStatus(PaymentStatus.FAILED);
            orderRepository.save(order);

            log.warn("Payment failed for reference: {}. Reason: {}",
                    payment.getPaymentReference(), response.getResponseMessage());
        }

        return paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public void processWebhook(HesabePaymentResponse response) throws Exception {
        log.info("Processing webhook for payment: {}", response.getOrderReferenceNumber());

        Payment payment = paymentRepository.findByPaymentReference(response.getOrderReferenceNumber())
                .orElse(null);

        if (payment == null) {
            log.warn("Payment not found for webhook: {}", response.getOrderReferenceNumber());
            return;
        }

        // Update payment status
        payment.setWebhookReceived(true);
        payment.setWebhookReceivedAt(LocalDateTime.now());

        if (response.isSuccessful() && payment.getStatus() != PaymentStatus.COMPLETED) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setCompletedAt(LocalDateTime.now());
            payment.setTransactionId(response.getTransactionId());

            Order order = payment.getOrder();
            order.setPaymentStatus(PaymentStatus.COMPLETED);
            order.setDeliveryStatus(DeliveryStatus.CONFIRMED);
            orderRepository.save(order);

            // Send emails on webhook success (backup in case callback didn't send)
            try {
                emailService.sendOrderConfirmationEmail(
                        order.getUser().getEmail(),
                        order.getOrderNumber(),
                        "Total Amount: KWD " + order.getTotalAmount()
                );
            } catch (Exception e) {
                log.error("Failed to send order confirmation email via webhook", e);
            }

            // Send owner notification via webhook (backup)
            try {
                emailService.sendNewOrderNotificationToOwner(
                        order.getOrderNumber(),
                        order.getTotalAmount().toString(),
                        order.getUser() != null ? order.getUser().getName() : "Guest"
                );
                log.info("Owner notification sent via webhook for order: {}", order.getOrderNumber());
            } catch (Exception e) {
                log.error("Failed to send owner notification via webhook", e);
            }
        }

        paymentRepository.save(payment);
    }

    @Override
    public Payment getPaymentByReference(String paymentReference) throws Exception {
        return paymentRepository.findByPaymentReference(paymentReference)
                .orElseThrow(() -> new PaymentException("Payment not found"));
    }

    @Override
    public Payment getPaymentByHesabeId(String hesabePaymentId) throws Exception {
        return paymentRepository.findByHesabePaymentId(hesabePaymentId)
                .orElseThrow(() -> new PaymentException("Payment not found"));
    }

    @Override
    public List<Payment> getPaymentsByOrderId(Long orderId) {
        return paymentRepository.findByOrderOrderId(orderId);
    }

    @Override
    public List<Payment> getPaymentsByUserId(UUID userId) {
        return paymentRepository.findRecentPaymentsByUserId(userId);
    }

    @Override
    public PaymentResponse checkPaymentStatus(String paymentReference) throws Exception {
        Payment payment = getPaymentByReference(paymentReference);

        return PaymentResponse.builder()
                .success(payment.getStatus() == PaymentStatus.COMPLETED)
                .paymentReference(payment.getPaymentReference())
                .status(payment.getStatus())
                .paymentMethod(payment.getPaymentMethod())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .transactionId(payment.getTransactionId())
                .authorizationCode(payment.getAuthorizationCode())
                .message(payment.getResponseMessage())
                .build();
    }

    @Override
    @Transactional
    public PaymentResponse initiateRefund(String paymentReference, Double amount, String reason) throws Exception {
        Payment payment = getPaymentByReference(paymentReference);

        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new PaymentException("Cannot refund a payment that is not completed");
        }

        if (payment.isRefunded()) {
            throw new PaymentException("Payment has already been refunded");
        }

        // TODO: Call Hesabe refund API
        // For now, we'll mark it as refunded locally

        payment.setRefundAmount(amount != null ? amount : payment.getAmount());
        payment.setRefundReason(reason);
        payment.setRefundedAt(LocalDateTime.now());
        payment.setRefundReference(generatePaymentReference());
        payment.setStatus(amount != null && amount < payment.getAmount()
                ? PaymentStatus.PARTIALLY_REFUNDED
                : PaymentStatus.REFUNDED);

        paymentRepository.save(payment);

        // Update order
        Order order = payment.getOrder();
        order.setPaymentStatus(payment.getStatus());
        orderRepository.save(order);

        return PaymentResponse.builder()
                .success(true)
                .message("Refund initiated successfully")
                .paymentReference(payment.getRefundReference())
                .amount(payment.getRefundAmount())
                .status(payment.getStatus())
                .build();
    }

    @Override
    public List<HesabePaymentService.PaymentMethodInfo> getAvailablePaymentMethods() {
        List<PaymentMethodInfo> methods = new ArrayList<>();

        methods.add(new PaymentMethodInfo(
                PaymentMethod.KNET, "KNET", "كي نت", "knet-icon",
                true, 0.100, 5000.0));

        methods.add(new PaymentMethodInfo(
                PaymentMethod.VISA, "Visa", "فيزا", "visa-icon",
                true, 0.100, 10000.0));

        methods.add(new PaymentMethodInfo(
                PaymentMethod.MASTERCARD, "Mastercard", "ماستركارد", "mastercard-icon",
                true, 0.100, 10000.0));

        methods.add(new PaymentMethodInfo(
                PaymentMethod.AMERICAN_EXPRESS, "American Express", "أمريكان إكسبريس", "amex-icon",
                true, 0.100, 10000.0));

        methods.add(new PaymentMethodInfo(
                PaymentMethod.APPLE_PAY, "Apple Pay", "أبل باي", "apple-pay-icon",
                true, 0.100, 5000.0));

        methods.add(new PaymentMethodInfo(
                PaymentMethod.GOOGLE_PAY, "Google Pay", "جوجل باي", "google-pay-icon",
                true, 0.100, 5000.0));

        methods.add(new PaymentMethodInfo(
                PaymentMethod.CASH_ON_DELIVERY, "Cash on Delivery", "الدفع عند الاستلام", "cod-icon",
                true, 0.0, 100.0)); // COD limited to 100 KWD

        return methods;
    }

    @Override
    public boolean isPaymentMethodAvailable(PaymentMethod method, Double amount) {
        return getAvailablePaymentMethods().stream()
                .filter(m -> m.method() == method)
                .findFirst()
                .map(m -> m.available() && amount >= m.minAmount() && amount <= m.maxAmount())
                .orElse(false);
    }

    @Override
    @Transactional
    public void cancelPayment(String paymentReference) throws Exception {
        Payment payment = getPaymentByReference(paymentReference);

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            throw new PaymentException("Cannot cancel a completed payment. Use refund instead.");
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        paymentRepository.save(payment);

        Order order = payment.getOrder();
        order.setPaymentStatus(PaymentStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Override
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    @Transactional
    public void handleExpiredPayments() {
        LocalDateTime expiryTime = LocalDateTime.now().minusHours(1);
        List<Payment> expiredPayments = paymentRepository.findExpiredPendingPayments(
                PaymentStatus.PENDING, expiryTime);

        for (Payment payment : expiredPayments) {
            payment.setStatus(PaymentStatus.EXPIRED);
            payment.setExpiredAt(LocalDateTime.now());
            paymentRepository.save(payment);

            log.info("Marked payment as expired: {}", payment.getPaymentReference());
        }
    }

    // ============ Private Helper Methods ============

    private PaymentResponse handleCashOnDelivery(Payment payment, Order order) {
        payment.setStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);

        order.setPaymentStatus(PaymentStatus.PENDING);
        order.setDeliveryStatus(DeliveryStatus.CONFIRMED);
        orderRepository.save(order);

        // Send order confirmation for COD orders (they are confirmed immediately)
        try {
            emailService.sendOrderConfirmationEmail(
                    order.getUser().getEmail(),
                    order.getOrderNumber(),
                    "Total Amount: KWD " + order.getTotalAmount() + " (Cash on Delivery)"
            );
            log.info("Order confirmation email sent for COD order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.error("Failed to send order confirmation email for COD order: {}", order.getOrderNumber(), e);
        }

        // Send owner notification for COD orders
        try {
            StringBuilder itemsBuilder = new StringBuilder();
            if (order.getOrderItems() != null) {
                for (var item : order.getOrderItems()) {
                    itemsBuilder.append(String.format(
                            "<div style='padding:10px;background:#f5f5f5;margin:5px 0;border-radius:5px;'>" +
                                    "<strong>%s</strong> × %d = KWD %.3f</div>",
                            item.getProduct().getProductName(),
                            item.getQuantity(),
                            item.getTotalPrice()
                    ));
                }
            }

            emailService.sendNewOrderNotificationToOwner(
                    order.getOrderNumber(),
                    order.getUser() != null ? order.getUser().getName() : "Guest",
                    order.getUser() != null ? order.getUser().getEmail() : "-",
                    order.getUser() != null ? order.getUser().getPhoneNumber() : "-",
                    order.getRecipientName(),
                    order.getRecipientPhone(),
                    order.getDeliveryAddress(),
                    order.getDeliveryArea(),
                    order.getPreferredDeliveryDate() != null ? order.getPreferredDeliveryDate().toString() : null,
                    order.getCardMessage(),
                    order.getDeliveryNotes(),
                    itemsBuilder.toString(),
                    order.getTotalAmount().toString(),
                    "Cash on Delivery"
            );
            log.info("Owner notification sent for COD order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.error("Failed to send owner notification for COD order: {}", order.getOrderNumber(), e);
        }

        return PaymentResponse.builder()
                .success(true)
                .message("Order placed with Cash on Delivery")
                .paymentReference(payment.getPaymentReference())
                .status(PaymentStatus.PENDING)
                .paymentMethod(PaymentMethod.CASH_ON_DELIVERY)
                .amount(payment.getAmount())
                .currency("KWD")
                .orderId(order.getOrderId())
                .build();
    }

    private HesabeCheckoutResponse callHesabeCheckoutApi(String encryptedData) throws Exception {
        String url = hesabeConfig.getBaseUrl() + hesabeConfig.getCheckoutEndpoint();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("accessCode", hesabeConfig.getApiKey());
        headers.set("Accept", "application/json");

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("data", encryptedData);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

        log.info("Calling Hesabe API: URL={}, MerchantCode={}", url, hesabeConfig.getMerchantCode());

        try {
            ResponseEntity<HesabeCheckoutResponse> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, HesabeCheckoutResponse.class);

            return response.getBody();
        } catch (Exception e) {
            log.error("Error calling Hesabe API: {}", e.getMessage());
            throw new PaymentException("Failed to connect to payment gateway: " + e.getMessage());
        }
    }

    private String encryptData(String data) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(
                hesabeConfig.getSecretKey().getBytes(StandardCharsets.UTF_8), "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(
                hesabeConfig.getIvKey().getBytes(StandardCharsets.UTF_8));

        Cipher cipher = Cipher.getInstance(AES_ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);

        byte[] encrypted = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(encrypted);
    }

    private String decryptData(String encryptedData) throws Exception {
        SecretKeySpec secretKey = new SecretKeySpec(
                hesabeConfig.getSecretKey().getBytes(StandardCharsets.UTF_8), "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(
                hesabeConfig.getIvKey().getBytes(StandardCharsets.UTF_8));

        Cipher cipher = Cipher.getInstance(AES_ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);

        byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
        return new String(decrypted, StandardCharsets.UTF_8);
    }

    private String generatePaymentReference() {
        return "PAY-" + System.currentTimeMillis() + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}