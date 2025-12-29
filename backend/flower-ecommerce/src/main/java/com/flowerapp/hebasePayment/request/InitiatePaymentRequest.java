package com.flowerapp.hebasePayment.request;

import com.flowerapp.hebasePayment.domain.PaymentMethod;
import lombok.Data;

import java.util.UUID;

@Data
public class InitiatePaymentRequest {

    /**
     * Order ID(s) to pay for
     * Can be single order or multiple orders from cart
     */
    private Long orderId;

    /**
     * Payment Order ID (if already created)
     */
    private Long paymentOrderId;

    /**
     * Selected payment method (OPTIONAL)
     * If null or not provided, Hesabe payment page will show ALL available payment options
     * (KNET, Visa, Mastercard, Apple Pay, etc.)
     *
     * Set to a specific PaymentMethod to go directly to that payment type.
     * Set to CASH_ON_DELIVERY for COD orders.
     */
    private PaymentMethod paymentMethod;

    /**
     * If true, show all payment methods on Hesabe page regardless of paymentMethod value
     * Default: true (show all methods)
     */
    private boolean showAllPaymentMethods = true;

    /**
     * Customer email (optional, for receipt)
     */
    private String customerEmail;

    /**
     * Customer phone (optional)
     */
    private String customerPhone;

    /**
     * Customer name (optional)
     */
    private String customerName;

    /**
     * Custom return URL (optional)
     */
    private String returnUrl;

    /**
     * Device type for digital wallets
     */
    private String deviceType; // MOBILE, WEB

    /**
     * Save card for future use (for card payments)
     */
    private boolean saveCard;

    /**
     * Use saved card token
     */
    private String savedCardToken;
}