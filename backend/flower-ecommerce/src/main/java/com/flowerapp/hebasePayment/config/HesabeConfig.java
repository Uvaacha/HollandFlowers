package com.flowerapp.hebasePayment.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "hesabe")
@Data
public class HesabeConfig {

    /**
     * Hesabe Merchant Code
     */
    private String merchantCode;

    /**
     * Hesabe API Key
     */
    private String apiKey;

    /**
     * Hesabe Secret Key for encryption
     */
    private String secretKey;

    /**
     * Hesabe IV Key for AES encryption
     */
    private String ivKey;

    /**
     * Hesabe API Base URL
     * Sandbox: https://sandbox.hesabe.com
     * Production: https://api.hesabe.com
     */
    private String baseUrl = "https://api.hesabe.com";

    /**
     * Payment endpoint
     */
    private String checkoutEndpoint = "/checkout";

    /**
     * Payment status endpoint
     */
    private String paymentStatusEndpoint = "/payment/status";

    /**
     * Success redirect URL
     */
    private String successUrl;

    /**
     * Failure redirect URL
     */
    private String failureUrl;

    /**
     * Webhook/Response URL
     */
    private String responseUrl;

    /**
     * Webhook URL for server-to-server notifications
     */
    private String webhookUrl;

    /**
     * Default payment method (if not specified)
     */
    private String defaultPaymentMethod = "KNET";

    /**
     * Is sandbox mode enabled
     */
    private boolean sandboxMode = false;

    /**
     * Connection timeout in milliseconds
     */
    private int connectionTimeout = 30000;

    /**
     * Read timeout in milliseconds
     */
    private int readTimeout = 30000;
}