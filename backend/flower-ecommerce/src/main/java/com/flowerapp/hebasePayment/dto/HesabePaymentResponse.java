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
public class HesabePaymentResponse {

    /**
     * Response code from Hesabe
     * CAPTURED = Success
     * NOT CAPTURED = Failed
     */
    @JsonProperty("resultCode")
    private String resultCode;

    /**
     * Payment ID from Hesabe
     */
    @JsonProperty("paymentId")
    private String paymentId;

    /**
     * Our order reference number
     */
    @JsonProperty("orderReferenceNumber")
    private String orderReferenceNumber;

    /**
     * Amount paid
     */
    @JsonProperty("amount")
    private String amount;

    /**
     * Currency
     */
    @JsonProperty("currency")
    private String currency;

    /**
     * Payment method used
     */
    @JsonProperty("paymentType")
    private String paymentType;

    /**
     * Transaction ID
     */
    @JsonProperty("transactionId")
    private String transactionId;

    /**
     * Authorization code (for cards)
     */
    @JsonProperty("authorizationCode")
    private String authorizationCode;

    /**
     * Response message
     */
    @JsonProperty("responseMessage")
    private String responseMessage;

    /**
     * Variable 1 - Custom data we sent
     */
    @JsonProperty("variable1")
    private String variable1;

    /**
     * Variable 2
     */
    @JsonProperty("variable2")
    private String variable2;

    /**
     * Variable 3
     */
    @JsonProperty("variable3")
    private String variable3;

    /**
     * Variable 4
     */
    @JsonProperty("variable4")
    private String variable4;

    /**
     * Variable 5
     */
    @JsonProperty("variable5")
    private String variable5;

    /**
     * Administrative fees
     */
    @JsonProperty("administrativeFees")
    private String administrativeFees;

    // KNET specific fields
    @JsonProperty("knetPaymentId")
    private String knetPaymentId;

    @JsonProperty("knetTransactionId")
    private String knetTransactionId;

    @JsonProperty("knetReferenceId")
    private String knetReferenceId;

    @JsonProperty("knetResultCode")
    private String knetResultCode;

    // Card specific fields
    @JsonProperty("cardNumber")
    private String maskedCardNumber;

    @JsonProperty("cardBrand")
    private String cardBrand;

    @JsonProperty("cardExpiryMonth")
    private String cardExpiryMonth;

    @JsonProperty("cardExpiryYear")
    private String cardExpiryYear;

    /**
     * Payer name
     */
    @JsonProperty("payerName")
    private String payerName;

    /**
     * Payer email
     */
    @JsonProperty("payerEmail")
    private String payerEmail;

    /**
     * Payer phone
     */
    @JsonProperty("payerPhone")
    private String payerPhone;

    /**
     * Check if payment was successful
     * Hesabe returns "CAPTURED" for successful payments
     * Also check for common success codes: "000", "00", "SUCCESS", "ACCEPT"
     */
    public boolean isSuccessful() {
        if (resultCode == null) return false;
        
        String code = resultCode.toUpperCase().trim();
        return "CAPTURED".equals(code) || 
               "SUCCESS".equals(code) ||
               "ACCEPT".equals(code) ||
               "000".equals(code) ||
               "00".equals(code);
    }
}
