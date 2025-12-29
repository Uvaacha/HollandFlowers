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
     * 1 or 000 = Success
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
         * Encrypted checkout token (used for payment page redirect)
         */
        @JsonProperty("data")
        private String data;

        /**
         * Checkout URL to redirect customer
         * May be null - needs to be constructed using baseUrl + /payment?data={token}
         */
        @JsonProperty("checkoutUrl")
        private String checkoutUrl;

        /**
         * Payment ID
         */
        @JsonProperty("paymentId")
        private String paymentId;

        /**
         * Get the checkout URL - construct it if not provided
         * @param baseUrl Hesabe base URL (e.g., https://api.hesabe.com)
         * @return Full checkout URL for redirecting customer
         */
        public String getFullCheckoutUrl(String baseUrl) {
            if (checkoutUrl != null && !checkoutUrl.isEmpty()) {
                return checkoutUrl;
            }
            // Construct checkout URL if not provided
            if (data != null && !data.isEmpty()) {
                return baseUrl + "/payment?data=" + data;
            }
            return null;
        }
    }

    /**
     * Check if the response indicates success
     */
    public boolean isSuccessResponse() {
        return status || "1".equals(code) || "000".equals(code);
    }
}
