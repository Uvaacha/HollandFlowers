package com.flowerapp.order.dto;

import com.flowerapp.common.enums.DeliveryStatus;
import com.flowerapp.hebasePayment.domain.PaymentStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class OrderDto {

    // ==================== Request DTOs ====================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateOrderRequest {

        @NotEmpty(message = "Order must have at least one item")
        @Valid
        private List<OrderItemRequest> items;

        // ============ SENDER INFORMATION ============
        @Size(max = 100, message = "Sender name cannot exceed 100 characters")
        private String senderName;

        @Pattern(regexp = "^[+]?[0-9]{8,15}$", message = "Invalid sender phone number format")
        private String senderPhone;

        // ============ CARD MESSAGE & INSTRUCTIONS ============
        @Size(max = 500, message = "Card message must be less than 500 characters")
        private String cardMessage;

        @Size(max = 500, message = "Instruction message must be less than 500 characters")
        private String instructionMessage;

        // ============ RECIPIENT/DELIVERY INFO ============
        @NotBlank(message = "Recipient name is required")
        @Size(max = 100, message = "Recipient name cannot exceed 100 characters")
        private String recipientName;

        @NotBlank(message = "Recipient phone is required")
        @Pattern(regexp = "^[+]?[0-9]{8,15}$", message = "Invalid phone number format")
        private String recipientPhone;

        @NotBlank(message = "Delivery address is required")
        @Size(max = 500, message = "Delivery address cannot exceed 500 characters")
        private String deliveryAddress;

        @Size(max = 100, message = "Delivery area cannot exceed 100 characters")
        private String deliveryArea;

        @Size(max = 100, message = "Delivery city cannot exceed 100 characters")
        private String deliveryCity;

        @Size(max = 500, message = "Delivery notes cannot exceed 500 characters")
        private String deliveryNotes;

        private LocalDateTime preferredDeliveryDate;

        @Size(max = 50, message = "Coupon code cannot exceed 50 characters")
        private String couponCode;

        /**
         * Delivery fee amount (in KWD)
         * Should be passed from frontend based on delivery area
         */
        private BigDecimal deliveryFee;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemRequest {

        @NotNull(message = "Product ID is required")
        private UUID productId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        @Max(value = 100, message = "Quantity cannot exceed 100")
        private Integer quantity;

        @Size(max = 500, message = "Special instructions cannot exceed 500 characters")
        private String specialInstructions;

        // ============ NEW FIELDS - Per Item ============
        @Size(max = 500, message = "Card message cannot exceed 500 characters")
        private String cardMessage;

        private String deliveryDate;  // Format: "2025-12-28"

        private String deliveryTimeSlot;  // Format: "11:00-13:30"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateDeliveryStatusRequest {

        @NotNull(message = "Delivery status is required")
        private DeliveryStatus deliveryStatus;

        @Size(max = 500, message = "Note cannot exceed 500 characters")
        private String note;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CancelOrderRequest {

        @NotBlank(message = "Cancellation reason is required")
        @Size(max = 500, message = "Cancellation reason cannot exceed 500 characters")
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderSearchRequest {
        private UUID userId;
        private DeliveryStatus deliveryStatus;
        private PaymentStatus paymentStatus;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private String orderNumber;
        private String sortBy;
        private String sortDirection;
    }

    // ==================== Response DTOs ====================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderResponse {
        private Long orderId;
        private String orderNumber;
        private DeliveryStatus deliveryStatus;
        private PaymentStatus paymentStatus;

        // ============ SENDER INFO ============
        private String senderName;
        private String senderPhone;

        // ============ CARD MESSAGE & INSTRUCTIONS ============
        private String cardMessage;
        private String instructionMessage;

        // ============ DELIVERY INFO ============
        private String recipientName;
        private String recipientPhone;
        private String deliveryAddress;
        private String deliveryArea;
        private String deliveryCity;
        private String deliveryNotes;
        private LocalDateTime preferredDeliveryDate;
        private LocalDateTime actualDeliveryDate;

        // ============ PRICING ============
        private BigDecimal subtotal;
        private BigDecimal deliveryFee;
        private BigDecimal discountAmount;
        private BigDecimal totalAmount;
        private String couponCode;

        // ============ ITEMS ============
        private List<OrderItemResponse> items;

        // ============ USER INFO (for admin view) ============
        private UserSummary user;

        // ============ TIMESTAMPS ============
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime cancelledAt;
        private String cancellationReason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderListResponse {
        private Long orderId;
        private String orderNumber;
        private DeliveryStatus deliveryStatus;
        private PaymentStatus paymentStatus;
        private BigDecimal totalAmount;
        private int itemCount;
        private String recipientName;
        private String recipientPhone;
        private String deliveryArea;
        private LocalDateTime preferredDeliveryDate;
        private LocalDateTime createdAt;
        private UserSummary user;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private Long orderItemId;
        private UUID productId;
        private String productName;
        private String productImageUrl;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private String specialInstructions;

        // ============ NEW FIELDS - Per Item ============
        private String cardMessage;
        private String deliveryDate;
        private String deliveryTimeSlot;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSummary {
        private UUID userId;
        private String name;
        private String email;
        private String phone;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderStatistics {
        private long totalOrders;
        private long pendingOrders;
        private long confirmedOrders;
        private long processingOrders;
        private long outForDeliveryOrders;
        private long deliveredOrders;
        private long cancelledOrders;
        private BigDecimal totalRevenue;
        private BigDecimal averageOrderValue;
        private long todayOrders;
        private BigDecimal todayRevenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderStatusHistory {
        private DeliveryStatus status;
        private LocalDateTime changedAt;
        private String changedBy;
        private String note;
    }
}