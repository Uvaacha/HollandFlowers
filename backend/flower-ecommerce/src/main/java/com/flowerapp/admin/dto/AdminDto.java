package com.flowerapp.admin.dto;

import com.flowerapp.common.enums.DeliveryStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

public class AdminDto {

    // ==================== Admin User Management DTOs ====================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateAdminRequest {

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Phone is required")
        @Pattern(regexp = "^[+]?[0-9]{8,15}$", message = "Invalid phone number format")
        private String phone;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
                message = "Password must contain at least one uppercase, one lowercase, and one digit")
        private String password;

        @NotNull(message = "Role ID is required")
        @Min(value = 2, message = "Role ID must be at least 2 (ADMIN)")
        @Max(value = 3, message = "Role ID cannot exceed 3 (SUPER_ADMIN)")
        private Integer roleId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateAdminRequest {

        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        private String name;

        @Pattern(regexp = "^[+]?[0-9]{8,15}$", message = "Invalid phone number format")
        private String phone;

        @Min(value = 2, message = "Role ID must be at least 2 (ADMIN)")
        @Max(value = 3, message = "Role ID cannot exceed 3 (SUPER_ADMIN)")
        private Integer roleId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminResponse {
        private UUID userId;
        private String name;
        private String email;
        private String phone;
        private Integer roleId;
        private String roleName;
        private Boolean isActive;
        private Boolean isEmailVerified;
        private LocalDateTime lastLoginAt;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateUserStatusRequest {

        @NotNull(message = "Active status is required")
        private Boolean isActive;

        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateUserRoleRequest {

        @NotNull(message = "Role ID is required")
        @Min(value = 1, message = "Role ID must be at least 1")
        @Max(value = 3, message = "Role ID cannot exceed 3")
        private Integer roleId;
    }

    // ==================== User List DTOs ====================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserListResponse {
        private UUID userId;
        private String name;
        private String email;
        private String phone;
        private Integer roleId;
        private String roleName;
        private Boolean isActive;
        private Boolean isEmailVerified;
        private LocalDateTime lastLoginAt;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSearchRequest {
        private String keyword;
        private Integer roleId;
        private Boolean isActive;
        private LocalDateTime createdAfter;
        private LocalDateTime createdBefore;
    }

    // ==================== Order Management DTOs ====================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateOrderStatusRequest {

        @NotNull(message = "Order status is required")
        private DeliveryStatus orderStatus;

        @Size(max = 500, message = "Note cannot exceed 500 characters")
        private String note;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderSearchRequest {
        private UUID userId;
        private DeliveryStatus orderStatus;
        private String orderNumber;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
    }

    // ==================== Dashboard Statistics ====================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DashboardStatistics {
        private long totalUsers;
        private long totalProducts;
        private long totalCategories;
        private long totalOrders;
        private long pendingOrders;
        private long todayOrders;
        private long newUsersToday;
        private long lowStockProducts;
    }

    // ==================== Customer Management DTOs ====================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerResponse {
        private UUID userId;
        private String name;
        private String email;
        private String phoneNumber;
        private Boolean isActive;
        private Boolean isEmailVerified;
        private Boolean isPhoneVerified;
        private String profileImageUrl;
        private Integer totalOrders;
        private java.math.BigDecimal totalSpent;
        private LocalDateTime lastOrderAt;
        private LocalDateTime lastLoginAt;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerDetailResponse {
        private UUID userId;
        private String name;
        private String email;
        private String phoneNumber;
        private Boolean isActive;
        private Boolean isEmailVerified;
        private Boolean isPhoneVerified;
        private String profileImageUrl;
        private Integer totalOrders;
        private java.math.BigDecimal totalSpent;
        private LocalDateTime lastOrderAt;
        private LocalDateTime lastLoginAt;
        private LocalDateTime createdAt;
        private java.util.List<CustomerOrderSummary> recentOrders;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerOrderSummary {
        private Long orderId;
        private String orderNumber;
        private DeliveryStatus orderStatus;
        private java.math.BigDecimal totalAmount;
        private LocalDateTime orderDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerStats {
        private long totalCustomers;
        private long activeCustomers;
        private long newCustomersToday;
        private long newCustomersThisWeek;
        private long newCustomersThisMonth;
        private long customersWithOrders;
    }
}