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
public class HesabeCheckoutResponse {

    /**
     * Response status (success/failure)
     */
    @JsonProperty("status")
    private boolean status;

    /**
     * Response code
     * 000 = Success
     */
    @JsonProperty("code")
    private String code;

    /**
     * Response message
     */
    @JsonProperty("message")
    private String message;

    /**
     * Payment token for checkout
     */
    @JsonProperty("response")
    private HesabeResponseData response;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HesabeResponseData {

        /**
         * Encrypted checkout token
         */
        @JsonProperty("data")
        private String data;

        /**
         * Checkout URL to redirect customer
         */
        @JsonProperty("checkoutUrl")
        private String checkoutUrl;

        /**
         * Payment ID
         */
        @JsonProperty("paymentId")
        private String paymentId;
    }
}
