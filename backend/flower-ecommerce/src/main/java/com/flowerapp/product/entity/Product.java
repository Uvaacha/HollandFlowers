package com.flowerapp.product.entity;

import com.flowerapp.category.entity.Category;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_product_name", columnList = "product_name"),
        @Index(name = "idx_product_category", columnList = "category_id"),
        @Index(name = "idx_product_active", columnList = "is_active"),
        @Index(name = "idx_product_price", columnList = "final_price"),
        @Index(name = "idx_product_featured", columnList = "is_featured"),
        @Index(name = "idx_product_new_arrival", columnList = "is_new_arrival"),
        @Index(name = "idx_product_best_seller", columnList = "is_best_seller")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "product_id", updatable = false, nullable = false)
    private UUID productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "additional_images", columnDefinition = "TEXT")
    private String additionalImages; // JSON array of image URLs

    @Column(name = "actual_price", nullable = false, precision = 10, scale = 3)
    private BigDecimal actualPrice;

    @Column(name = "offer_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal offerPercentage = BigDecimal.ZERO;

    @Column(name = "final_price", nullable = false, precision = 10, scale = 3)
    private BigDecimal finalPrice;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "short_description", length = 500)
    private String shortDescription;

    @Column(name = "stock_quantity", nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    @Column(name = "sku", unique = true, length = 50)
    private String sku;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "is_new_arrival")
    @Builder.Default
    private Boolean isNewArrival = false;

    @Column(name = "is_best_seller")
    @Builder.Default
    private Boolean isBestSeller = false;

    @Column(name = "tags", length = 500)
    private String tags; // Comma-separated tags

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Dynamic getter that calculates final price on-the-fly.
     * This overrides Lombok's generated getter to ensure correct pricing
     * even if database value is stale.
     */
    public BigDecimal getFinalPrice() {
        if (actualPrice == null) {
            return BigDecimal.ZERO;
        }
        if (offerPercentage == null || offerPercentage.compareTo(BigDecimal.ZERO) <= 0) {
            return actualPrice;
        }
        BigDecimal discount = actualPrice.multiply(offerPercentage)
                .divide(BigDecimal.valueOf(100), 3, RoundingMode.HALF_UP);
        return actualPrice.subtract(discount);
    }

    @PrePersist
    @PreUpdate
    public void calculateFinalPrice() {
        if (actualPrice != null) {
            if (offerPercentage != null && offerPercentage.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal discount = actualPrice.multiply(offerPercentage)
                        .divide(BigDecimal.valueOf(100), 3, RoundingMode.HALF_UP);
                finalPrice = actualPrice.subtract(discount);
            } else {
                finalPrice = actualPrice;
            }
        }
    }

    public boolean isInStock() {
        return stockQuantity != null && stockQuantity > 0;
    }

    public void decreaseStock(int quantity) {
        if (stockQuantity != null && stockQuantity >= quantity) {
            stockQuantity -= quantity;
        }
    }

    public void increaseStock(int quantity) {
        if (stockQuantity == null) {
            stockQuantity = 0;
        }
        stockQuantity += quantity;
    }
}