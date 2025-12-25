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
     * Amount in the smallest currency unit (fils for KWD)
     * 1 KWD = 1000 fils
     */
    @JsonProperty("amount")
    private Long amount;

    /**
     * Payment method code
     * 1 = KNET
     * 2 = VISA/Mastercard/AMEX
     * 7 = Apple Pay
     * 8 = Google Pay
     */
    @JsonProperty("paymentType")
    private String paymentType;

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
    @JsonProperty("mobile")
    private String customerMobile;

    /**
     * Order description (optional)
     */
    @JsonProperty("orderDescription")
    private String orderDescription;
}
