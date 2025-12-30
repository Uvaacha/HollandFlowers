package com.flowerapp.hebasePayment.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
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
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ResponseWrapper {
        @JsonProperty("data")
        private PaymentData data;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PaymentData {
        @JsonProperty("resultCode")
        @JsonAlias({"result_code", "ResultCode", "status_code"})
        private String resultCode;

        @JsonProperty("amount")
        private Double amount;

        @JsonProperty("paymentToken")
        @JsonAlias({"payment_token", "token"})
        private String paymentToken;

        @JsonProperty("paymentId")
        @JsonAlias({"payment_id", "PaymentId", "transactionReference"})
        private String paymentId;

        @JsonProperty("paidOn")
        @JsonAlias({"paid_on", "paymentDate", "payment_date"})
        private String paidOn;

        @JsonProperty("orderReferenceNumber")
        @JsonAlias({"order_reference_number", "merchantOrderId", "merchant_order_id",
                "reference", "referenceNumber", "reference_number", "invoiceId",
                "invoice_id", "orderId", "order_id"})
        private String orderReferenceNumber;

        @JsonProperty("variable1")
        @JsonAlias({"Variable1", "var1", "custom1", "merchantData1"})
        private String variable1;

        @JsonProperty("variable2")
        @JsonAlias({"Variable2", "var2", "custom2", "merchantData2"})
        private String variable2;

        @JsonProperty("variable3")
        @JsonAlias({"Variable3", "var3", "custom3", "merchantData3"})
        private String variable3;

        @JsonProperty("variable4")
        @JsonAlias({"Variable4", "var4", "custom4", "merchantData4"})
        private String variable4;

        @JsonProperty("variable5")
        @JsonAlias({"Variable5", "var5", "custom5", "merchantData5"})
        private String variable5;

        @JsonProperty("method")
        @JsonAlias({"paymentMethod", "payment_method"})
        private Integer method;

        @JsonProperty("transactionId")
        @JsonAlias({"transaction_id", "TransactionId", "txnId"})
        private String transactionId;

        @JsonProperty("authorizationCode")
        @JsonAlias({"authorization_code", "authCode", "auth_code"})
        private String authorizationCode;

        @JsonProperty("responseMessage")
        @JsonAlias({"response_message", "statusMessage", "status_message"})
        private String responseMessage;

        @JsonProperty("administrativeFees")
        @JsonAlias({"administrative_fees", "fees"})
        private String administrativeFees;

        @JsonProperty("knetPaymentId")
        @JsonAlias({"knet_payment_id", "KnetPaymentId"})
        private String knetPaymentId;

        @JsonProperty("knetTransactionId")
        @JsonAlias({"knet_transaction_id", "KnetTransactionId"})
        private String knetTransactionId;

        @JsonProperty("knetReferenceId")
        @JsonAlias({"knet_reference_id", "KnetReferenceId"})
        private String knetReferenceId;

        @JsonProperty("knetResultCode")
        @JsonAlias({"knet_result_code", "KnetResultCode"})
        private String knetResultCode;

        @JsonProperty("cardNumber")
        @JsonAlias({"card_number", "maskedCardNumber", "masked_card_number", "maskedPan"})
        private String maskedCardNumber;

        @JsonProperty("cardBrand")
        @JsonAlias({"card_brand", "cardType", "card_type"})
        private String cardBrand;

        @JsonProperty("cardExpiryMonth")
        @JsonAlias({"card_expiry_month", "expiryMonth", "expiry_month"})
        private String cardExpiryMonth;

        @JsonProperty("cardExpiryYear")
        @JsonAlias({"card_expiry_year", "expiryYear", "expiry_year"})
        private String cardExpiryYear;

        public boolean isSuccessful() {
            if (resultCode == null) return false;
            String code = resultCode.toUpperCase().trim();
            return "CAPTURED".equals(code) || "SUCCESS".equals(code) ||
                    "ACCEPT".equals(code) || "000".equals(code) || "00".equals(code);
        }
    }

    public boolean isSuccessful() {
        return status && response != null && response.getData() != null
                && response.getData().isSuccessful();
    }

    public PaymentData getPaymentData() {
        return response != null ? response.getData() : null;
    }
}