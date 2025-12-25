package com.flowerapp.hebasePayment.response;

import com.flowerapp.hebasePayment.domain.PaymentMethod;
import com.flowerapp.hebasePayment.domain.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    /**
     * Was the payment initiation successful
     */
    private boolean success;

    /**
     * Message
     */
    private String message;

    /**
     * Our payment reference
     */
    private String paymentReference;

    /**
     * Hesabe payment ID
     */
    private String paymentId;

    /**
     * Checkout URL to redirect customer
     */
    private String checkoutUrl;

    /**
     * Payment token (encrypted)
     */
    private String paymentToken;

    /**
     * Payment status
     */
    private PaymentStatus status;

    /**
     * Payment method
     */
    private PaymentMethod paymentMethod;

    /**
     * Amount in KWD
     */
    private Double amount;

    /**
     * Currency
     */
    private String currency;

    /**
     * Order ID
     */
    private Long orderId;

    /**
     * Order reference
     */
    private String orderReference;

    /**
     * Expiry time for the payment session (ISO format)
     */
    private String expiresAt;

    /**
     * Error code if failed
     */
    private String errorCode;

    /**
     * Error message if failed
     */
    private String errorMessage;

    /**
     * For Apple Pay - merchant identifier
     */
    private String merchantIdentifier;

    /**
     * For Google Pay - merchant ID
     */
    private String merchantId;

    /**
     * Transaction ID (after completion)
     */
    private String transactionId;

    /**
     * Authorization code (for cards)
     */
    private String authorizationCode;
}
