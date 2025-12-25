package com.flowerapp.hebasePayment.domain;

public enum PaymentStatus {
    
    PENDING("Pending", "Payment initiated but not completed"),
    PROCESSING("Processing", "Payment is being processed"),
    COMPLETED("Completed", "Payment successfully completed"),
    CAPTURED("Captured", "Payment captured (for card payments)"),
    FAILED("Failed", "Payment failed"),
    CANCELLED("Cancelled", "Payment cancelled by user"),
    REFUNDED("Refunded", "Payment has been refunded"),
    PARTIALLY_REFUNDED("Partially Refunded", "Payment partially refunded"),
    EXPIRED("Expired", "Payment session expired"),
    ON_HOLD("On Hold", "Payment on hold for review");

    private final String displayName;
    private final String description;

    PaymentStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public boolean isSuccessful() {
        return this == COMPLETED || this == CAPTURED;
    }

    public boolean isFinal() {
        return this == COMPLETED || this == CAPTURED || this == FAILED || 
               this == CANCELLED || this == REFUNDED || this == EXPIRED;
    }

    public boolean canRefund() {
        return this == COMPLETED || this == CAPTURED;
    }

    /**
     * Map Hesabe response code to PaymentStatus
     */
    public static PaymentStatus fromHesabeResponseCode(String responseCode) {
        if (responseCode == null) return FAILED;
        
        switch (responseCode) {
            case "000":
            case "00":
                return COMPLETED;
            case "001":
                return PENDING;
            case "002":
                return PROCESSING;
            case "003":
            case "005":
                return FAILED;
            case "004":
                return CANCELLED;
            case "006":
                return EXPIRED;
            default:
                return FAILED;
        }
    }
}
