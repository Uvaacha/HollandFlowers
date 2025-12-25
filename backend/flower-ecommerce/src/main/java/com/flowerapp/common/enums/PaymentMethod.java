package com.flowerapp.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PaymentMethod {
    KNET("KNET", 1),
    VISA("Visa", 2),
    MASTERCARD("Mastercard", 2),
    AMERICAN_EXPRESS("American Express", 2),
    APPLE_PAY("Apple Pay", 3),
    GOOGLE_PAY("Google Pay", 4);

    private final String displayName;
    private final int hesabeCode;
}
