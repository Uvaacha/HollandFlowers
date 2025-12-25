package com.flowerapp.hebasePayment.service;

import com.flowerapp.hebasePayment.domain.PaymentMethod;
import com.flowerapp.hebasePayment.dto.HesabePaymentResponse;
import com.flowerapp.hebasePayment.model.Payment;
import com.flowerapp.hebasePayment.model.PaymentOrder;
import com.flowerapp.hebasePayment.request.InitiatePaymentRequest;
import com.flowerapp.hebasePayment.response.PaymentResponse;
import com.flowerapp.order.entity.Order;
import com.flowerapp.user.entity.User;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface HesabePaymentService {

    /**
     * Initiate a payment for an order
     */
    PaymentResponse initiatePayment(InitiatePaymentRequest request, User user) throws Exception;

    @Transactional
//    PaymentResponse initiatePayment(InitiatePaymentRequest request, User user) throws Exception;

    /**
     * Create payment order for multiple orders (cart checkout)
     */
    PaymentOrder createPaymentOrder(User user, Set<Order> orders, PaymentMethod paymentMethod) throws Exception;

    /**
     * Process Hesabe callback/response
     */
    Payment processPaymentCallback(String encryptedData) throws Exception;

    /**
     * Process Hesabe webhook
     */
    void processWebhook(HesabePaymentResponse response) throws Exception;

    /**
     * Get payment by reference
     */
    Payment getPaymentByReference(String paymentReference) throws Exception;

    /**
     * Get payment by Hesabe payment ID
     */
    Payment getPaymentByHesabeId(String hesabePaymentId) throws Exception;

    /**
     * Get all payments for an order
     */
    List<Payment> getPaymentsByOrderId(Long orderId);

    /**
     * Get all payments for a user
     */
    List<Payment> getPaymentsByUserId(UUID userId);

    /**
     * Check payment status with Hesabe
     */
    PaymentResponse checkPaymentStatus(String paymentReference) throws Exception;

    /**
     * Initiate refund
     */
    PaymentResponse initiateRefund(String paymentReference, Double amount, String reason) throws Exception;

    /**
     * Get available payment methods
     */
    List<PaymentMethodInfo> getAvailablePaymentMethods();

    /**
     * Verify if payment method is available for amount
     */
    boolean isPaymentMethodAvailable(PaymentMethod method, Double amount);

    /**
     * Cancel a pending payment
     */
    void cancelPayment(String paymentReference) throws Exception;

    /**
     * Handle expired payments
     */
    void handleExpiredPayments();

    /**
     * Payment method info DTO
     */
    record PaymentMethodInfo(
            PaymentMethod method,
            String displayName,
            String displayNameArabic,
            String icon,
            boolean available,
            Double minAmount,
            Double maxAmount
    ) {}
}
