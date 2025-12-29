package com.flowerapp.hebasePayment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HesabeCheckoutRequest {

    /**
     * Merchant code provided by Hesabe
     */
    @JsonProperty("merchantCode")
    private String merchantCode;

    /**
     * Amount in KWD (e.g., 10.500)
     * Minimum: 0.200 KWD, Maximum: 100000 KWD
     * Format: numeric with up to 3 decimal places
     */
    @JsonProperty("amount")
    private Double amount;

    /**
     * Payment method code
     * 0 = Show all payment methods
     * 1 = KNET
     * 2 = VISA/Mastercard (MPGS)
     * 5 = CYBS
     * 7 = AMEX
     * 8 = MPGS AMEX
     * 9 = MPGS Apple Pay
     * 16 = Google Pay
     */
    @JsonProperty("paymentType")
    private Integer paymentType;

    /**
     * Unique order reference number
     */
    @JsonProperty("orderReferenceNumber")
    private String orderReferenceNumber;

    /**
     * Variable 1 - Can be used for custom data
     */
    @JsonProperty("variable1")
    private String variable1;

    /**
     * Variable 2 - Can be used for custom data
     */
    @JsonProperty("variable2")
    private String variable2;

    /**
     * Variable 3 - Can be used for custom data
     */
    @JsonProperty("variable3")
    private String variable3;

    /**
     * Variable 4 - Can be used for custom data
     */
    @JsonProperty("variable4")
    private String variable4;

    /**
     * Variable 5 - Can be used for custom data
     */
    @JsonProperty("variable5")
    private String variable5;

    /**
     * Response URL - Hesabe will redirect here after payment
     */
    @JsonProperty("responseUrl")
    private String responseUrl;

    /**
     * Failure URL - Redirect on failure (optional)
     */
    @JsonProperty("failureUrl")
    private String failureUrl;

    /**
     * Version of the API
     */
    @JsonProperty("version")
    private String version = "2.0";

    /**
     * Currency code (optional, defaults to KWD)
     */
    @JsonProperty("currency")
    private String currency = "KWD";

    /**
     * Customer name (optional)
     */
    @JsonProperty("name")
    private String customerName;

    /**
     * Customer email (optional)
     */
    @JsonProperty("email")
    private String customerEmail;

    /**
     * Customer mobile (optional)
     */
    @JsonProperty("mobile_number")
    private String customerMobile;

    /**
     * Webhook URL for server-to-server notifications
     */
    @JsonProperty("webhookUrl")
    private String webhookUrl;

    /**
     * Order description (optional)
     */
    @JsonProperty("orderDescription")
    private String orderDescription;
}