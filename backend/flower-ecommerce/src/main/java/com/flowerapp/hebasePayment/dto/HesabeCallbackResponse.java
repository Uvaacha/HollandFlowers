package com.flowerapp.hebasePayment.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Wrapper class for Hesabe callback response
 *
 * ACTUAL Hesabe response structure (from production logs):
 * {
 *   "status": true,
 *   "code": 1,
 *   "message": "Transaction Success",
 *   "response": {
 *     "resultCode": "CAPTURED",
 *     "amount": "1.300",
 *     "paymentId": "536413135481",
 *     "orderReferenceNumber": "ORD-xxx",
 *     "variable1": "PAY-xxx",
 *     "variable2": "ORD-xxx",
 *     "variable3": "76",
 *     ...
 *   }
 * }
 *
 * NOTE: Data is DIRECTLY in "response", NOT in "response.data"!
 */
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

    // FIXED: "response" contains PaymentData directly, NOT wrapped in "data"
    @JsonProperty("response")
    private PaymentData response;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PaymentData {

        @JsonProperty("resultCode")
        @JsonAlias({"result_code", "ResultCode", "status_code", "statusCode", "result"})
        private String resultCode;

        @JsonProperty("amount")
        @JsonAlias({"Amount", "total", "totalAmount", "paid_amount"})
        private String amount;  // Changed to String as Hesabe returns "1.300"

        @JsonProperty("baseAmount")
        private String baseAmount;

        @JsonProperty("currency")
        private String currency;

        @JsonProperty("paymentToken")
        @JsonAlias({"payment_token", "PaymentToken", "token"})
        private String paymentToken;

        @JsonProperty("paymentId")
        @JsonAlias({"payment_id", "PaymentId", "id", "transId", "trans_id"})
        private String paymentId;

        @JsonProperty("paidOn")
        @JsonAlias({"paid_on", "PaidOn", "paymentDate", "transactionDate", "transaction_date"})
        private String paidOn;

        @JsonProperty("orderReferenceNumber")
        @JsonAlias({
                "order_reference_number", "OrderReferenceNumber", "orderReference",
                "order_reference", "merchantOrderId", "merchant_order_id",
                "referenceNumber", "reference_number", "refNo", "ref_no",
                "invoiceNo", "invoice_no", "trackId", "track_id", "reference"
        })
        private String orderReferenceNumber;

        @JsonProperty("auth")
        @JsonAlias({"authorizationCode", "authorization_code", "AuthorizationCode", "authCode", "auth_code"})
        private String auth;

        @JsonProperty("trackID")
        @JsonAlias({"trackId", "track_id"})
        private String trackID;

        @JsonProperty("transactionId")
        @JsonAlias({"transaction_id", "TransactionId", "tranId", "tran_id"})
        private String transactionId;

        @JsonProperty("Id")
        @JsonAlias({"id", "ID"})
        private Long hesabeId;

        @JsonProperty("bankReferenceId")
        @JsonAlias({"bank_reference_id", "BankReferenceId"})
        private String bankReferenceId;

        @JsonProperty("variable1")
        @JsonAlias({"Variable1", "var1", "udf1", "UDF1", "custom1", "UserDefined1"})
        private String variable1;

        @JsonProperty("variable2")
        @JsonAlias({"Variable2", "var2", "udf2", "UDF2", "custom2", "UserDefined2"})
        private String variable2;

        @JsonProperty("variable3")
        @JsonAlias({"Variable3", "var3", "udf3", "UDF3", "custom3", "UserDefined3"})
        private String variable3;

        @JsonProperty("variable4")
        @JsonAlias({"Variable4", "var4", "udf4", "UDF4", "custom4", "UserDefined4"})
        private String variable4;

        @JsonProperty("variable5")
        @JsonAlias({"Variable5", "var5", "udf5", "UDF5", "custom5", "UserDefined5"})
        private String variable5;

        @JsonProperty("method")
        @JsonAlias({"Method", "paymentMethod", "payment_method"})
        private Integer method;

        @JsonProperty("administrativeCharge")
        @JsonAlias({"administrative_charge", "AdministrativeCharge", "fees", "administrativeFees"})
        private String administrativeCharge;

        @JsonProperty("responseMessage")
        @JsonAlias({"response_message", "ResponseMessage", "errorMessage", "error_message"})
        private String responseMessage;

        // KNET specific fields
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

        // Card specific fields
        @JsonProperty("cardNumber")
        @JsonAlias({"card_number", "CardNumber", "maskedCardNumber", "masked_card_number"})
        private String maskedCardNumber;

        @JsonProperty("cardBrand")
        @JsonAlias({"card_brand", "CardBrand", "brand"})
        private String cardBrand;

        @JsonProperty("cardExpiryMonth")
        @JsonAlias({"card_expiry_month", "CardExpiryMonth", "expiryMonth", "expiry_month"})
        private String cardExpiryMonth;

        @JsonProperty("cardExpiryYear")
        @JsonAlias({"card_expiry_year", "CardExpiryYear", "expiryYear", "expiry_year"})
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
                    "APPROVED".equals(code) ||
                    "000".equals(code) ||
                    "00".equals(code);
        }

        /**
         * Get authorization code (maps from 'auth' field)
         */
        public String getAuthorizationCode() {
            return auth;
        }
    }

    /**
     * Check if the overall response is successful
     */
    public boolean isSuccessful() {
        return status && response != null && response.isSuccessful();
    }

    /**
     * Get the payment data from the response
     * FIXED: response IS the PaymentData, not response.data
     */
    public PaymentData getPaymentData() {
        return response;
    }
}