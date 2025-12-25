package com.flowerapp.product.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ProductDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateProductRequest {
        @NotNull(message = "Category ID is required")
        private UUID categoryId;

        @NotBlank(message = "Product name is required")
        @Size(min = 2, max = 200, message = "Product name must be between 2 and 200 characters")
        private String productName;

        private String imageUrl;

        private List<String> additionalImages;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.001", message = "Price must be greater than 0")
        private BigDecimal actualPrice;

        @DecimalMin(value = "0.00", message = "Offer percentage cannot be negative")
        @DecimalMax(value = "100.00", message = "Offer percentage cannot exceed 100")
        private BigDecimal offerPercentage;

        private String description;

        @Size(max = 500, message = "Short description cannot exceed 500 characters")
        private String shortDescription;

        @Min(value = 0, message = "Stock quantity cannot be negative")
        private Integer stockQuantity;

        @Size(max = 50, message = "SKU cannot exceed 50 characters")
        private String sku;

        private Boolean isFeatured;

        private Boolean isNewArrival;

        private Boolean isBestSeller;

        private String tags;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateProductRequest {
        private UUID categoryId;

        @Size(min = 2, max = 200, message = "Product name must be between 2 and 200 characters")
        private String productName;

        private String imageUrl;

        private List<String> additionalImages;

        @DecimalMin(value = "0.001", message = "Price must be greater than 0")
        private BigDecimal actualPrice;

        @DecimalMin(value = "0.00", message = "Offer percentage cannot be negative")
        @DecimalMax(value = "100.00", message = "Offer percentage cannot exceed 100")
        private BigDecimal offerPercentage;

        private String description;

        @Size(max = 500, message = "Short description cannot exceed 500 characters")
        private String shortDescription;

        @Min(value = 0, message = "Stock quantity cannot be negative")
        private Integer stockQuantity;

        @Size(max = 50, message = "SKU cannot exceed 50 characters")
        private String sku;

        private Boolean isActive;

        private Boolean isFeatured;

        private Boolean isNewArrival;

        private Boolean isBestSeller;

        private String tags;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ProductResponse {
        private UUID productId;
        private UUID categoryId;
        private String categoryName;
        private String productName;
        private String imageUrl;
        private List<String> additionalImages;
        private BigDecimal actualPrice;
        private BigDecimal offerPercentage;
        private BigDecimal finalPrice;
        private String description;
        private String shortDescription;
        private Integer stockQuantity;
        private Boolean inStock;
        private String sku;
        private Boolean isActive;
        private Boolean isFeatured;
        private Boolean isNewArrival;
        private Boolean isBestSeller;
        private String tags;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductListResponse {
        private UUID productId;
        private UUID categoryId;
        private String productName;
        private String sku;
        private String imageUrl;
        private BigDecimal actualPrice;
        private BigDecimal offerPercentage;
        private BigDecimal finalPrice;
        private String categoryName;
        private Integer stockQuantity;
        private Boolean inStock;
        private Boolean isActive;
        private Boolean isFeatured;
        private Boolean isNewArrival;
        private Boolean isBestSeller;
        private String tags;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStockRequest {
        @NotNull(message = "Quantity is required")
        private Integer quantity;

        @NotBlank(message = "Operation is required")
        @Pattern(regexp = "^(ADD|SUBTRACT|SET)$", message = "Operation must be ADD, SUBTRACT, or SET")
        private String operation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSearchRequest {
        private String keyword;
        private UUID categoryId;
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private Boolean inStock;
        private Boolean isFeatured;
        private Boolean isNewArrival;
        private Boolean isBestSeller;
        private String sortBy; // price, name, createdAt
        private String sortOrder; // asc, desc
    }
}