package com.flowerapp.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DeliveryStatus {
    PENDING("Pending", "Order has been placed and awaiting confirmation"),
    CONFIRMED("Confirmed", "Order has been confirmed"),
    PROCESSING("Processing", "Order is being prepared"),
    OUT_FOR_DELIVERY("Out for Delivery", "Order is on the way"),
    DELIVERED("Delivered", "Order has been delivered successfully"),
    CANCELLED("Cancelled", "Order has been cancelled"),
    REFUNDED("Refunded", "Order has been refunded");

    private final String displayName;
    private final String description;
}
