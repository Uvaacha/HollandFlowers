package com.flowerapp.hebasePayment.controller;

import com.flowerapp.hebasePayment.domain.PaymentMethod;
import com.flowerapp.hebasePayment.model.Payment;
import com.flowerapp.hebasePayment.request.InitiatePaymentRequest;
import com.flowerapp.hebasePayment.response.PaymentResponse;
import com.flowerapp.hebasePayment.service.HesabePaymentService;
import com.flowerapp.hebasePayment.service.HesabePaymentService.PaymentMethodInfo;
import com.flowerapp.user.entity.User;
import com.flowerapp.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment", description = "Hesabe Payment Gateway APIs")
public class PaymentController {

    private final HesabePaymentService paymentService;
    private final UserService userService;

    /**
     * Get available payment methods
     */
    @GetMapping("/methods")
    @Operation(summary = "Get available payment methods",
            description = "Returns all available payment methods: KNET, Visa, Mastercard, American Express, Apple Pay, Google Pay, Cash on Delivery")
    public ResponseEntity<List<PaymentMethodInfo>> getPaymentMethods() {
        List<PaymentMethodInfo> methods = paymentService.getAvailablePaymentMethods();
        return ResponseEntity.ok(methods);
    }

    /**
     * Initiate a payment
     */
    @PostMapping("/initiate")
    @Operation(summary = "Initiate payment",
            description = "Initiates a payment for an order. Returns checkout URL for redirect-based payment methods.")
    public ResponseEntity<PaymentResponse> initiatePayment(
            @RequestBody InitiatePaymentRequest request,
            @RequestHeader("Authorization") String jwt) {

        try {
            User user = userService.findUserProfileByJwt(jwt);
            PaymentResponse response = paymentService.initiatePayment(request, user);

            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            log.error("Payment initiation failed: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                    PaymentResponse.builder()
                            .success(false)
                            .message("Payment initiation failed")
                            .errorMessage(e.getMessage())
                            .build()
            );
        }
    }

    /**
     * Handle Hesabe callback (redirect from payment page)
     */
    @GetMapping("/callback")
    @Operation(summary = "Payment callback", description = "Handles callback from Hesabe after payment completion")
    public ResponseEntity<Map<String, Object>> handleCallback(
            @RequestParam("data") String encryptedData) {

        Map<String, Object> response = new HashMap<>();

        try {
            Payment payment = paymentService.processPaymentCallback(encryptedData);

            response.put("success", payment.getStatus().isSuccessful());
            response.put("paymentReference", payment.getPaymentReference());
            response.put("status", payment.getStatus());
            response.put("orderId", payment.getOrder().getOrderId());
            response.put("orderReference", payment.getOrder().getOrderId());
            response.put("transactionId", payment.getTransactionId());
            response.put("message", payment.getStatus().isSuccessful()
                    ? "Payment successful"
                    : "Payment failed: " + payment.getResponseMessage());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Payment callback processing failed: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Payment verification failed");
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Handle Hesabe webhook (server-to-server notification)
     */
    @PostMapping("/webhook")
    @Operation(summary = "Payment webhook", description = "Receives server-to-server notifications from Hesabe")
    public ResponseEntity<String> handleWebhook(
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "accessCode", required = false) String accessCode) {
        log.info("Received payment webhook");

        try {
            // Verify the access code if provided
            // Note: Implement proper webhook signature verification for production

            // The payload contains encrypted data in the "data" field
            String encryptedData = payload.get("data");
            if (encryptedData != null && !encryptedData.isEmpty()) {
                Payment payment = paymentService.processPaymentCallback(encryptedData);
                log.info("Webhook processed successfully for payment: {}", payment.getPaymentReference());
            }

            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            log.error("Webhook processing failed: {}", e.getMessage(), e);
            // Return 200 OK even on error to prevent Hesabe from retrying
            // Log the error for investigation
            return ResponseEntity.ok("OK");
        }
    }

    /**
     * Check payment status
     */
    @GetMapping("/status/{paymentReference}")
    @Operation(summary = "Check payment status", description = "Returns current status of a payment")
    public ResponseEntity<PaymentResponse> checkPaymentStatus(
            @PathVariable String paymentReference,
            @RequestHeader("Authorization") String jwt) {

        try {
            PaymentResponse response = paymentService.checkPaymentStatus(paymentReference);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Payment status check failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    PaymentResponse.builder()
                            .success(false)
                            .message("Failed to check payment status")
                            .errorMessage(e.getMessage())
                            .build()
            );
        }
    }

    /**
     * Get payment details
     */
    @GetMapping("/{paymentReference}")
    @Operation(summary = "Get payment details", description = "Returns details of a specific payment")
    public ResponseEntity<Payment> getPayment(
            @PathVariable String paymentReference,
            @RequestHeader("Authorization") String jwt) {

        try {
            Payment payment = paymentService.getPaymentByReference(paymentReference);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            log.error("Get payment failed: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get user's payment history
     */
    @GetMapping("/user/history")
    @Operation(summary = "Get user payment history", description = "Returns all payments made by the authenticated user")
    public ResponseEntity<List<Payment>> getUserPayments(
            @RequestHeader("Authorization") String jwt) {

        try {
            User user = userService.findUserProfileByJwt(jwt);
            List<Payment> payments = paymentService.getPaymentsByUserId(user.getUserId());
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            log.error("Get user payments failed: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get payments for an order
     */
    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get order payments", description = "Returns all payment attempts for an order")
    public ResponseEntity<List<Payment>> getOrderPayments(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String jwt) {

        List<Payment> payments = paymentService.getPaymentsByOrderId(orderId);
        return ResponseEntity.ok(payments);
    }

    /**
     * Cancel a pending payment
     */
    @PostMapping("/{paymentReference}/cancel")
    @Operation(summary = "Cancel payment", description = "Cancels a pending payment")
    public ResponseEntity<Map<String, Object>> cancelPayment(
            @PathVariable String paymentReference,
            @RequestHeader("Authorization") String jwt) {

        Map<String, Object> response = new HashMap<>();

        try {
            paymentService.cancelPayment(paymentReference);
            response.put("success", true);
            response.put("message", "Payment cancelled successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Payment cancellation failed: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Initiate refund (Admin only)
     */
    @PostMapping("/admin/{paymentReference}/refund")
    @Operation(summary = "Initiate refund", description = "Initiates a refund for a completed payment (Admin only)")
    public ResponseEntity<PaymentResponse> initiateRefund(
            @PathVariable String paymentReference,
            @RequestParam(required = false) Double amount,
            @RequestParam(required = false) String reason,
            @RequestHeader("Authorization") String jwt) {

        try {
            PaymentResponse response = paymentService.initiateRefund(paymentReference, amount, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Refund initiation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                    PaymentResponse.builder()
                            .success(false)
                            .message("Refund failed")
                            .errorMessage(e.getMessage())
                            .build()
            );
        }
    }

    /**
     * Verify payment method availability for amount
     */
    @GetMapping("/methods/verify")
    @Operation(summary = "Verify payment method", description = "Checks if a payment method is available for a specific amount")
    public ResponseEntity<Map<String, Object>> verifyPaymentMethod(
            @RequestParam String method,
            @RequestParam Double amount) {

        Map<String, Object> response = new HashMap<>();

        try {
            PaymentMethod paymentMethod = PaymentMethod.valueOf(method.toUpperCase());
            boolean available = paymentService.isPaymentMethodAvailable(paymentMethod, amount);

            response.put("method", method);
            response.put("amount", amount);
            response.put("available", available);
            response.put("message", available
                    ? "Payment method available"
                    : "Payment method not available for this amount");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("available", false);
            response.put("message", "Invalid payment method: " + method);
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get payment method details by code
     */
    @GetMapping("/methods/{methodCode}")
    @Operation(summary = "Get payment method details", description = "Returns details of a specific payment method")
    public ResponseEntity<Map<String, Object>> getPaymentMethodDetails(@PathVariable String methodCode) {
        Map<String, Object> response = new HashMap<>();

        try {
            PaymentMethod method = PaymentMethod.valueOf(methodCode.toUpperCase());
            List<PaymentMethodInfo> allMethods = paymentService.getAvailablePaymentMethods();

            PaymentMethodInfo methodInfo = allMethods.stream()
                    .filter(m -> m.method() == method)
                    .findFirst()
                    .orElse(null);

            if (methodInfo != null) {
                response.put("code", method.getCode());
                response.put("hesabeCode", method.getHesabeCode());
                response.put("displayName", methodInfo.displayName());
                response.put("displayNameArabic", methodInfo.displayNameArabic());
                response.put("icon", methodInfo.icon());
                response.put("available", methodInfo.available());
                response.put("minAmount", methodInfo.minAmount());
                response.put("maxAmount", methodInfo.maxAmount());
                response.put("isCardPayment", method.isCardPayment());
                response.put("isDigitalWallet", method.isDigitalWallet());
                return ResponseEntity.ok(response);
            }

            response.put("error", "Payment method not found");
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            response.put("error", "Invalid payment method code: " + methodCode);
            return ResponseEntity.badRequest().body(response);
        }
    }
}