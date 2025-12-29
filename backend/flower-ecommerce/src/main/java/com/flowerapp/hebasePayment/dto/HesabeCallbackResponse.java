package com.flowerapp.hebasePayment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Wrapper class for Hesabe callback response
 *
 * Sample response structure:
 * {
 *   "status": true,
 *   "code": 1,
 *   "message": "Transaction Success",
 *   "response": {
 *     "data": {
 *       "resultCode": "CAPTURED",
 *       "amount": 10,
 *       "paymentToken": "...",
 *       "paymentId": "...",
 *       "paidOn": "2019-09-30 11:05:16",
 *       "orderReferenceNumber": "...",
 *       "variable1": "...",
 *       ...
 *     }
 *   }
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HesabeCallbackResponse {

    @JsonProperty("status")
    private boolean status;

    @JsonProperty("code")
    private Integer code;

    @JsonProperty("message")
    private String message;

    @JsonProperty("response")
    private ResponseWrapper response;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResponseWrapper {
        @JsonProperty("data")
        private PaymentData data;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentData {
        @JsonProperty("resultCode")
        private String resultCode;

        @JsonProperty("amount")
        private Double amount;

        @JsonProperty("paymentToken")
        private String paymentToken;

        @JsonProperty("paymentId")
        private String paymentId;

        @JsonProperty("paidOn")
        private String paidOn;

        @JsonProperty("orderReferenceNumber")
        private String orderReferenceNumber;

        @JsonProperty("variable1")
        private String variable1;

        @JsonProperty("variable2")
        private String variable2;

        @JsonProperty("variable3")
        private String variable3;

        @JsonProperty("variable4")
        private String variable4;

        @JsonProperty("variable5")
        private String variable5;

        @JsonProperty("method")
        private Integer method;

        @JsonProperty("transactionId")
        private String transactionId;

        @JsonProperty("authorizationCode")
        private String authorizationCode;

        @JsonProperty("responseMessage")
        private String responseMessage;

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
         * Check if payment was successful
         * Hesabe returns "CAPTURED" for successful payments
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

    /**
     * Check if the overall response is successful
     */
    public boolean isSuccessful() {
        return status && response != null && response.getData() != null
                && response.getData().isSuccessful();
    }

    /**
     * Get the payment data from the response
     */
    public PaymentData getPaymentData() {
        return response != null ? response.getData() : null;
    }
}