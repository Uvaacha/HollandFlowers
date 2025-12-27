package com.flowerapp.order.entity;

import com.flowerapp.common.enums.DeliveryStatus;
import com.flowerapp.hebasePayment.domain.PaymentStatus;
import com.flowerapp.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_order_user", columnList = "user_id"),
        @Index(name = "idx_order_delivery_status", columnList = "delivery_status"),
        @Index(name = "idx_order_payment_status", columnList = "payment_status"),
        @Index(name = "idx_order_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "order_number", unique = true, nullable = false, length = 20)
    private String orderNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", nullable = false, length = 30)
    @Builder.Default
    private DeliveryStatus deliveryStatus = DeliveryStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    // ============ SENDER INFORMATION (Person placing the order) ============
    @Column(name = "sender_name", length = 100)
    private String senderName;

    @Column(name = "sender_phone", length = 20)
    private String senderPhone;

    // ============ CARD MESSAGE & INSTRUCTIONS ============
    @Column(name = "card_message", length = 500)
    private String cardMessage;

    @Column(name = "instruction_message", length = 500)
    private String instructionMessage;

    // ============ DELIVERY ADDRESS (Recipient) ============
    @Column(name = "recipient_name", nullable = false, length = 100)
    private String recipientName;

    @Column(name = "recipient_phone", nullable = false, length = 20)
    private String recipientPhone;

    @Column(name = "delivery_address", nullable = false, length = 500)
    private String deliveryAddress;

    @Column(name = "delivery_area", length = 100)
    private String deliveryArea;

    @Column(name = "delivery_city", length = 100)
    private String deliveryCity;

    @Column(name = "delivery_notes", length = 500)
    private String deliveryNotes;

    // ============ PRICING ============
    @Column(name = "subtotal", nullable = false, precision = 10, scale = 3)
    private BigDecimal subtotal;

    @Column(name = "delivery_fee", precision = 10, scale = 3)
    @Builder.Default
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 3)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 3)
    private BigDecimal totalAmount;

    @Column(name = "coupon_code", length = 50)
    private String couponCode;

    // ============ DELIVERY DATE ============
    @Column(name = "preferred_delivery_date")
    private LocalDateTime preferredDeliveryDate;

    @Column(name = "actual_delivery_date")
    private LocalDateTime actualDeliveryDate;

    // ============ ORDER ITEMS ============
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();

    // ============ TIMESTAMPS ============
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    // ============ HELPER METHODS ============
    public void addOrderItem(OrderItem item) {
        orderItems.add(item);
        item.setOrder(this);
    }

    public void removeOrderItem(OrderItem item) {
        orderItems.remove(item);
        item.setOrder(null);
    }

    public void calculateTotals() {
        this.subtotal = orderItems.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.totalAmount = this.subtotal
                .add(this.deliveryFee != null ? this.deliveryFee : BigDecimal.ZERO)
                .subtract(this.discountAmount != null ? this.discountAmount : BigDecimal.ZERO);
    }

    public boolean canBeCancelled() {
        return this.deliveryStatus == DeliveryStatus.PENDING ||
                this.deliveryStatus == DeliveryStatus.CONFIRMED;
    }

    public boolean isDelivered() {
        return this.deliveryStatus == DeliveryStatus.DELIVERED;
    }

    @PrePersist
    public void generateOrderNumber() {
        if (this.orderNumber == null) {
            this.orderNumber = "ORD-" + System.currentTimeMillis() + "-" +
                    String.format("%04d", (int)(Math.random() * 10000));
        }
    }
}