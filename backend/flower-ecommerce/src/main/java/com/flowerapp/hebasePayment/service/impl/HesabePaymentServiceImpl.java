package com.flowerapp.hebasePayment.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowerapp.common.enums.DeliveryStatus;
import com.flowerapp.hebasePayment.config.HesabeConfig;
import com.flowerapp.hebasePayment.domain.PaymentMethod;
import com.flowerapp.hebasePayment.domain.PaymentStatus;
import com.flowerapp.hebasePayment.dto.HesabeCallbackResponse;
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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

    private static final String AES_ENCRYPT_ALGORITHM = "AES/CBC/PKCS5Padding";
    private static final String AES_DECRYPT_ALGORITHM = "AES/CBC/NoPadding";
    private static final java.util.HexFormat HEX = java.util.HexFormat.of();

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

        // Calculate amount (Hesabe expects amount in KWD, e.g., 10.500)
        // Minimum amount is 0.200 KWD, maximum is 100000 KWD
        Double amountKwd = order.getTotalAmount().doubleValue();

        // Validate amount
        if (amountKwd < 0.200) {
            throw new PaymentException("Minimum payment amount is 0.200 KWD");
        }
        if (amountKwd > 100000) {
            throw new PaymentException("Maximum payment amount is 100,000 KWD");
        }

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
                .amountInFils(Math.round(amountKwd * 1000)) // Store fils for reference
                .currency("KWD")
                .customerEmail(request.getCustomerEmail() != null ? request.getCustomerEmail() : user.getEmail())
                .customerPhone(request.getCustomerPhone() != null ? request.getCustomerPhone() : user.getPhoneNumber())
                .createdAt(LocalDateTime.now())
                .build();

        // Handle Cash on Delivery separately
        if (request.getPaymentMethod() == PaymentMethod.CASH_ON_DELIVERY) {
            return handleCashOnDelivery(payment, order);
        }

        // Determine payment type:
        // - paymentType=0 shows ALL payment options on Hesabe payment page (KNET, Visa, Mastercard, Apple Pay, etc.)
        // - Use specific hesabe code only if showAllPaymentMethods is false AND a specific method is selected
        String paymentType = "0"; // Default: show all payment methods on Hesabe page

        if (!request.isShowAllPaymentMethods() && request.getPaymentMethod() != null
                && request.getPaymentMethod() != PaymentMethod.CASH_ON_DELIVERY) {
            paymentType = request.getPaymentMethod().getHesabeCode();
        }

        log.info("Using paymentType={} (0=all methods, other=specific method)", paymentType);

        // Build Hesabe checkout request
        // Note: amount should be in KWD (e.g., 10.500), not fils
        // paymentType=0 shows all payment options on Hesabe payment page
        HesabeCheckoutRequest checkoutRequest = HesabeCheckoutRequest.builder()
                .merchantCode(hesabeConfig.getMerchantCode())
                .amount(amountKwd) // Amount in KWD (e.g., 10.500)
                .paymentType(paymentType) // 0 = show all methods, or specific code
                .orderReferenceNumber(paymentReference)
                .responseUrl(hesabeConfig.getResponseUrl())
                .failureUrl(hesabeConfig.getFailureUrl())
                .webhookUrl(hesabeConfig.getWebhookUrl()) // Add webhook URL
                .version("2.0")
                .currency("KWD")
                .customerName(user.getName())
                .customerEmail(payment.getCustomerEmail())
                .customerMobile(payment.getCustomerPhone())
                .variable1(String.valueOf(order.getOrderId()))
                .variable2(order.getOrderNumber())
                .variable3(user.getUserId().toString())
                .orderDescription("Order #" + order.getOrderNumber())
                .build();

        // Encrypt request
        String encryptedRequest = encryptData(objectMapper.writeValueAsString(checkoutRequest));

        // Call Hesabe API
        HesabeCheckoutResponse hesabeResponse = callHesabeCheckoutApi(encryptedRequest);

        if (!hesabeResponse.isSuccessResponse()) {
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

        // Get checkout URL - construct if not provided
        String checkoutUrl = hesabeResponse.getResponse().getFullCheckoutUrl(hesabeConfig.getBaseUrl());
        payment.setCheckoutUrl(checkoutUrl);
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
        log.info("Raw callback data (first 100 chars): {}",
                encryptedData != null ? encryptedData.substring(0, Math.min(100, encryptedData.length())) : "null");

        // Step 1: URL-decode if necessary (callback data may be URL-encoded)
        String decodedData = encryptedData;
        try {
            // Check if data is URL-encoded (contains %XX patterns)
            if (encryptedData.contains("%")) {
                decodedData = java.net.URLDecoder.decode(encryptedData, StandardCharsets.UTF_8);
                log.info("URL-decoded callback data");
            }
        } catch (Exception e) {
            log.warn("URL decoding failed, using raw data: {}", e.getMessage());
        }

        // Step 2: Extract HEX data from response
        String hexData = extractHexFromResponse(decodedData);
        log.info("Extracted HEX data (first 100 chars): {}",
                hexData.substring(0, Math.min(100, hexData.length())));

        // Step 3: Decrypt response (HEX encoded AES-256-CBC)
        String decryptedData = decryptData(hexData);
        log.info("Decrypted callback data: {}", decryptedData);

        // Step 4: Parse the response - it can be either wrapped or direct format
        HesabeCallbackResponse.PaymentData paymentData = parsePaymentCallback(decryptedData);

        if (paymentData == null) {
            throw new PaymentException("Failed to parse payment callback data");
        }

        log.info("Payment callback - Reference: {}, Result: {}",
                paymentData.getOrderReferenceNumber(), paymentData.getResultCode());

        // Find payment by reference
        Payment payment = paymentRepository.findByPaymentReference(paymentData.getOrderReferenceNumber())
                .orElseThrow(() -> new PaymentException("Payment not found for reference: " + paymentData.getOrderReferenceNumber()));

        // Update payment with response data
        payment.setTransactionId(paymentData.getTransactionId());
        payment.setAuthorizationCode(paymentData.getAuthorizationCode());
        payment.setResultCode(paymentData.getResultCode());
        payment.setResponseCode(paymentData.getResultCode());
        payment.setResponseMessage(paymentData.getResponseMessage());
        payment.setWebhookReceived(true);
        payment.setWebhookReceivedAt(LocalDateTime.now());

        // Set Hesabe payment ID
        if (paymentData.getPaymentId() != null) {
            payment.setHesabePaymentId(paymentData.getPaymentId());
        }

        // KNET specific fields
        if (paymentData.getKnetPaymentId() != null) {
            payment.setKnetPaymentId(paymentData.getKnetPaymentId());
            payment.setKnetTransactionId(paymentData.getKnetTransactionId());
            payment.setKnetReferenceId(paymentData.getKnetReferenceId());
            payment.setKnetResultCode(paymentData.getKnetResultCode());
        }

        // Card specific fields
        if (paymentData.getMaskedCardNumber() != null) {
            payment.setMaskedCardNumber(paymentData.getMaskedCardNumber());
            payment.setCardBrand(paymentData.getCardBrand());
            payment.setCardExpiryMonth(paymentData.getCardExpiryMonth());
            payment.setCardExpiryYear(paymentData.getCardExpiryYear());
        }

        // Update status based on result
        if (paymentData.isSuccessful()) {
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
            payment.setErrorDetails(paymentData.getResponseMessage());

            // Update order status
            Order order = payment.getOrder();
            order.setPaymentStatus(PaymentStatus.FAILED);
            orderRepository.save(order);

            log.warn("Payment failed for reference: {}. Reason: {}",
                    payment.getPaymentReference(), paymentData.getResponseMessage());
        }

        return paymentRepository.save(payment);
    }

    /**
     * Parse the payment callback data
     * Handles both wrapped format (status/code/message/response.data) and direct format
     */
    private HesabeCallbackResponse.PaymentData parsePaymentCallback(String decryptedData) {
        try {
            // First try to parse as wrapped response (standard Hesabe format)
            // {status: true, code: 1, message: "...", response: {data: {...}}}
            if (decryptedData.contains("\"response\"") && decryptedData.contains("\"data\"")) {
                HesabeCallbackResponse wrappedResponse = objectMapper.readValue(decryptedData, HesabeCallbackResponse.class);
                if (wrappedResponse.getPaymentData() != null) {
                    log.info("Parsed wrapped callback response. Status: {}, Code: {}",
                            wrappedResponse.isStatus(), wrappedResponse.getCode());
                    return wrappedResponse.getPaymentData();
                }
            }

            // Fallback: try to parse as direct PaymentData
            log.info("Attempting to parse as direct payment data format");
            return objectMapper.readValue(decryptedData, HesabeCallbackResponse.PaymentData.class);

        } catch (Exception e) {
            log.error("Failed to parse payment callback: {}", e.getMessage());

            // Last resort: try parsing as HesabePaymentResponse (old format)
            try {
                HesabePaymentResponse oldFormat = objectMapper.readValue(decryptedData, HesabePaymentResponse.class);
                // Convert to PaymentData
                HesabeCallbackResponse.PaymentData data = new HesabeCallbackResponse.PaymentData();
                data.setResultCode(oldFormat.getResultCode());
                data.setOrderReferenceNumber(oldFormat.getOrderReferenceNumber());
                data.setPaymentId(oldFormat.getPaymentId());
                data.setTransactionId(oldFormat.getTransactionId());
                data.setAuthorizationCode(oldFormat.getAuthorizationCode());
                data.setResponseMessage(oldFormat.getResponseMessage());
                data.setVariable1(oldFormat.getVariable1());
                data.setVariable2(oldFormat.getVariable2());
                data.setVariable3(oldFormat.getVariable3());
                data.setKnetPaymentId(oldFormat.getKnetPaymentId());
                data.setKnetTransactionId(oldFormat.getKnetTransactionId());
                data.setKnetReferenceId(oldFormat.getKnetReferenceId());
                data.setKnetResultCode(oldFormat.getKnetResultCode());
                data.setMaskedCardNumber(oldFormat.getMaskedCardNumber());
                data.setCardBrand(oldFormat.getCardBrand());
                data.setCardExpiryMonth(oldFormat.getCardExpiryMonth());
                data.setCardExpiryYear(oldFormat.getCardExpiryYear());
                return data;
            } catch (Exception ex) {
                log.error("Failed to parse as old format: {}", ex.getMessage());
                return null;
            }
        }
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
        // Use form-urlencoded content type per Hesabe documentation
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set("accessCode", hesabeConfig.getAccessCode());
        headers.set("Accept", "application/json");

        // Send as form-urlencoded: data=<encrypted_hex>
        String formBody = "data=" + java.net.URLEncoder.encode(encryptedData, StandardCharsets.UTF_8);

        HttpEntity<String> entity = new HttpEntity<>(formBody, headers);

        log.info("Calling Hesabe API: URL={}, MerchantCode={}", url, hesabeConfig.getMerchantCode());
        log.debug("Encrypted request data: {}...", encryptedData.substring(0, Math.min(50, encryptedData.length())));

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);

            String responseBody = response.getBody();
            log.debug("Hesabe API raw response: {}", responseBody);

            if (responseBody == null || responseBody.isEmpty()) {
                throw new PaymentException("Empty response from Hesabe API");
            }

            // Extract HEX-encoded encrypted data from response
            String encryptedResponseHex = extractHexFromResponse(responseBody);

            // Decrypt the response
            String decryptedResponse = decryptData(encryptedResponseHex);
            log.info("Decrypted Hesabe response: {}", decryptedResponse);

            // Check if response indicates success
            if (!decryptedResponse.contains("\"status\":true")) {
                log.error("Hesabe checkout failed. Response: {}", decryptedResponse);
                // Try to parse error response
                try {
                    return objectMapper.readValue(decryptedResponse, HesabeCheckoutResponse.class);
                } catch (Exception e) {
                    throw new PaymentException("Hesabe checkout failed: " + decryptedResponse);
                }
            }

            // Parse the decrypted response
            HesabeCheckoutResponse hesabeResponse = objectMapper.readValue(decryptedResponse, HesabeCheckoutResponse.class);

            // Extract response.data for payment URL (per Hesabe documentation)
            // $responseToken = $responseDataJson->response->data;
            // return Redirect::to($paymentUrl . '?data='. $responseToken);
            if (hesabeResponse.getResponse() != null && hesabeResponse.getResponse().getData() != null) {
                String paymentToken = hesabeResponse.getResponse().getData();
                log.info("Payment token (response.data): {}...", paymentToken.substring(0, Math.min(50, paymentToken.length())));
            }

            return hesabeResponse;

        } catch (PaymentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error calling Hesabe API: {}", e.getMessage(), e);
            throw new PaymentException("Failed to connect to payment gateway: " + e.getMessage());
        }
    }

    /**
     * Extract HEX-encoded data from Hesabe response
     * Response may be raw HEX or JSON with "data" field containing HEX
     */
    private String extractHexFromResponse(String body) {
        log.debug("Extracting HEX from response: {}", body);
        String trimmed = body.trim();

        // Check if the response is raw HEX (only hex characters)
        if (trimmed.matches("^[0-9a-fA-F]+$")) {
            return trimmed;
        }

        // Try to extract from JSON: {"data": "<hex>"}
        java.util.regex.Pattern p = java.util.regex.Pattern.compile("\"data\"\\s*:\\s*\"([0-9a-fA-F]+)\"");
        java.util.regex.Matcher m = p.matcher(body);
        if (m.find()) {
            return m.group(1);
        }

        // Fallback - return trimmed body
        return trimmed;
    }

    /**
     * Encrypt data using AES-256-CBC with PKCS5Padding and return as HEX string
     * Per Hesabe documentation:
     * - Algorithm: AES/CBC/PKCS5Padding for encryption
     * - Key: 32 bytes (256 bits)
     * - IV: 16 bytes
     * - Output: HEX encoded
     */
    private String encryptData(String data) throws Exception {
        log.debug("Encrypting data, length: {}", data.length());

        SecretKeySpec secretKey = new SecretKeySpec(
                hesabeConfig.getSecretKey().getBytes(StandardCharsets.UTF_8), "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(
                hesabeConfig.getIvKey().getBytes(StandardCharsets.UTF_8));

        Cipher cipher = Cipher.getInstance(AES_ENCRYPT_ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, ivSpec);

        byte[] encrypted = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));

        // Return as HEX string per Hesabe requirements
        String hexResult = HEX.formatHex(encrypted);
        log.debug("Encrypted data HEX length: {}", hexResult.length());

        return hexResult;
    }

    /**
     * Decrypt HEX-encoded data using AES-256-CBC with NoPadding
     * Per Hesabe documentation:
     * - Algorithm: AES/CBC/NoPadding for decryption
     * - Key: 32 bytes (256 bits)
     * - IV: 16 bytes
     * - Input: HEX encoded
     * - Must manually trim null bytes after decryption
     */
    private String decryptData(String hexCipherText) throws Exception {
        log.debug("Decrypting HEX data, length: {}", hexCipherText.length());

        SecretKeySpec secretKey = new SecretKeySpec(
                hesabeConfig.getSecretKey().getBytes(StandardCharsets.UTF_8), "AES");
        IvParameterSpec ivSpec = new IvParameterSpec(
                hesabeConfig.getIvKey().getBytes(StandardCharsets.UTF_8));

        Cipher cipher = Cipher.getInstance(AES_DECRYPT_ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);

        // Parse HEX string to bytes (case insensitive)
        byte[] cipherBytes = HEX.parseHex(hexCipherText.toLowerCase());
        byte[] decrypted = cipher.doFinal(cipherBytes);

        // Trim null bytes (zero-padding) from the end - required for NoPadding mode
        int end = decrypted.length;
        while (end > 0 && decrypted[end - 1] == 0) end--;

        String result = new String(Arrays.copyOf(decrypted, end), StandardCharsets.UTF_8);
        log.debug("Decrypted data length: {}", result.length());

        return result;
    }

    private String generatePaymentReference() {
        return "PAY-" + System.currentTimeMillis() + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}