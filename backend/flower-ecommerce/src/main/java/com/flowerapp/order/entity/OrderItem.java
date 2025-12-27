package com.flowerapp.order.entity;

import com.flowerapp.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "order_items", indexes = {
        @Index(name = "idx_order_item_order", columnList = "order_id"),
        @Index(name = "idx_order_item_product", columnList = "product_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_item_id")
    private Long orderItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(name = "product_image_url", length = 500)
    private String productImageUrl;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 3)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 3)
    private BigDecimal totalPrice;

    @Column(name = "special_instructions", length = 500)
    private String specialInstructions;

    // ============ NEW FIELDS - Per Item ============

    @Column(name = "card_message", length = 500)
    private String cardMessage;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "delivery_time_slot", length = 50)
    private String deliveryTimeSlot;  // e.g., "11:00-13:30"

    @PrePersist
    @PreUpdate
    public void calculateTotalPrice() {
        if (this.unitPrice != null && this.quantity != null) {
            this.totalPrice = this.unitPrice.multiply(BigDecimal.valueOf(this.quantity));
        }
    }

    // Static factory method for creating from Product
    public static OrderItem fromProduct(Product product, int quantity) {
        return OrderItem.builder()
                .product(product)
                .productName(product.getProductName())
                .productImageUrl(product.getImageUrl())
                .quantity(quantity)
                .unitPrice(product.getFinalPrice())
                .totalPrice(product.getFinalPrice().multiply(BigDecimal.valueOf(quantity)))
                .build();
    }

    // Static factory method with all details
    public static OrderItem fromProductWithDetails(
            Product product,
            int quantity,
            String cardMessage,
            LocalDate deliveryDate,
            String deliveryTimeSlot,
            String specialInstructions
    ) {
        return OrderItem.builder()
                .product(product)
                .productName(product.getProductName())
                .productImageUrl(product.getImageUrl())
                .quantity(quantity)
                .unitPrice(product.getFinalPrice())
                .totalPrice(product.getFinalPrice().multiply(BigDecimal.valueOf(quantity)))
                .cardMessage(cardMessage)
                .deliveryDate(deliveryDate)
                .deliveryTimeSlot(deliveryTimeSlot)
                .specialInstructions(specialInstructions)
                .build();
    }
}