package com.flowerapp.hebasePayment.model;

import com.flowerapp.hebasePayment.domain.PaymentMethod;
import com.flowerapp.hebasePayment.domain.PaymentStatus;
import com.flowerapp.order.entity.Order;
import com.flowerapp.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "payment_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique payment order reference
     */
    @Column(unique = true)
    private String paymentOrderReference;

    /**
     * Total amount to be paid
     */
    private Long amount;

    /**
     * Amount in KWD (for display)
     */
    private Double amountKwd;

    /**
     * Currency
     */
    private String currency = "KWD";

    /**
     * Payment status
     */
    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.PENDING;

    /**
     * Selected payment method
     */
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    /**
     * Hesabe payment link ID
     */
    private String paymentLinkId;

    /**
     * Hesabe checkout URL
     */
    @Column(length = 1000)
    private String checkoutUrl;

    /**
     * Associated orders (can be multiple in cart checkout)
     */
    @ManyToMany
    @JoinTable(
            name = "payment_order_orders",
            joinColumns = @JoinColumn(name = "payment_order_id"),
            inverseJoinColumns = @JoinColumn(name = "order_id")
    )
    private Set<Order> orders = new HashSet<>();

    /**
     * User making the payment
     */
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    /**
     * Associated payment record
     */
    @OneToOne
    @JoinColumn(name = "payment_id")
    private Payment payment;

    /**
     * Timestamps
     */
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
    private LocalDateTime expiresAt;

    /**
     * Order details snapshot
     */
    private Integer totalItems;
    private Double subtotal;
    private Double deliveryCharge;
    private Double discount;
    private Double tax;

    @PrePersist
    public void prePersist() {
        if (expiresAt == null) {
            expiresAt = LocalDateTime.now().plusHours(1); // 1 hour expiry
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
