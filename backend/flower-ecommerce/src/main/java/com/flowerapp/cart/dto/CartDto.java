package com.flowerapp.cart.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class CartDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartResponse {
        private UUID cartId;
        private List<CartItemResponse> items;
        private int itemCount;
        private BigDecimal subtotal;
        private BigDecimal originalTotal;
        private BigDecimal savings;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemResponse {
        private UUID cartItemId;
        private UUID productId;
        private String productName;
        private String productNameAr;
        private String imageUrl;
        private BigDecimal price;
        private BigDecimal originalPrice;
        private BigDecimal finalPrice;
        private Integer quantity;
        private String selectedVariant;
        private String deliveryDate;
        private String deliveryTime;
        private String cardMessage;
        private String senderInfo;
        private BigDecimal itemTotal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddToCartRequest {
        private UUID productId;
        private Integer quantity;
        private String selectedVariant;
        private String deliveryDate;
        private String deliveryTime;
        private String cardMessage;
        private String senderInfo;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateCartItemRequest {
        private UUID cartItemId;
        private Integer quantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SyncCartRequest {
        private List<SyncCartItem> items;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SyncCartItem {
        private UUID productId;
        private String id; // Frontend uses string IDs sometimes
        private Integer quantity;
        private String selectedVariant;
        private BigDecimal price;
        private String deliveryDate;
        private String deliveryTime;
        private String cardMessage;
        private String senderInfo;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RemoveItemRequest {
        private UUID productId;
        private String selectedVariant;
    }
}