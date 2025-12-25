package com.flowerapp.hebasePayment.domain;

public enum PaymentMethod {
    
    // Kuwait National Payment System
    KNET("KNET", "1", "Kuwait National Payment"),
    
    // Card Payments
    VISA("VISA", "2", "Visa Card"),
    MASTERCARD("MASTERCARD", "2", "Mastercard"),
    AMERICAN_EXPRESS("AMEX", "2", "American Express"),
    
    // Digital Wallets
    APPLE_PAY("APPLE_PAY", "7", "Apple Pay"),
    GOOGLE_PAY("GOOGLE_PAY", "8", "Google Pay"),
    SAMSUNG_PAY("SAMSUNG_PAY", "9", "Samsung Pay"),
    
    // Other Methods
    CASH_ON_DELIVERY("COD", "0", "Cash on Delivery"),
    WALLET("WALLET", "10", "Hesabe Wallet");

    private final String code;
    private final String hesabeCode; // Hesabe payment method code
    private final String displayName;

    PaymentMethod(String code, String hesabeCode, String displayName) {
        this.code = code;
        this.hesabeCode = hesabeCode;
        this.displayName = displayName;
    }

    public String getCode() {
        return code;
    }

    public String getHesabeCode() {
        return hesabeCode;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static PaymentMethod fromCode(String code) {
        for (PaymentMethod method : values()) {
            if (method.code.equalsIgnoreCase(code)) {
                return method;
            }
        }
        throw new IllegalArgumentException("Unknown payment method code: " + code);
    }

    public static PaymentMethod fromHesabeCode(String hesabeCode) {
        for (PaymentMethod method : values()) {
            if (method.hesabeCode.equals(hesabeCode)) {
                return method;
            }
        }
        return KNET; // Default to KNET
    }

    public boolean isCardPayment() {
        return this == VISA || this == MASTERCARD || this == AMERICAN_EXPRESS;
    }

    public boolean isDigitalWallet() {
        return this == APPLE_PAY || this == GOOGLE_PAY || this == SAMSUNG_PAY;
    }

    public boolean requiresOnlineProcessing() {
        return this != CASH_ON_DELIVERY;
    }
}
