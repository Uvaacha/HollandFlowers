package com.flowerapp.cart.entity;

import com.flowerapp.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cart_items", indexes = {
        @Index(name = "idx_cart_item_cart", columnList = "cart_id"),
        @Index(name = "idx_cart_item_product", columnList = "product_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "cart_item_id", updatable = false, nullable = false)
    private UUID cartItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "selected_variant", length = 100)
    private String selectedVariant;

    @Column(name = "price_at_addition", precision = 10, scale = 3)
    private BigDecimal priceAtAddition;

    @Column(name = "delivery_date", length = 50)
    private String deliveryDate;

    @Column(name = "delivery_time", length = 50)
    private String deliveryTime;

    @Column(name = "card_message", columnDefinition = "TEXT")
    private String cardMessage;

    @Column(name = "sender_info", length = 255)
    private String senderInfo;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Calculate item total
    public BigDecimal getItemTotal() {
        if (priceAtAddition != null && quantity != null) {
            return priceAtAddition.multiply(BigDecimal.valueOf(quantity));
        }
        return BigDecimal.ZERO;
    }
}