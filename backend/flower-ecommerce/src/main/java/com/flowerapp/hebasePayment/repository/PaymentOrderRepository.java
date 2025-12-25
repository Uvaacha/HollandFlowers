package com.flowerapp.hebasePayment.repository;

import com.flowerapp.hebasePayment.domain.PaymentStatus;
import com.flowerapp.hebasePayment.model.Payment;
import com.flowerapp.hebasePayment.model.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {

    Optional<PaymentOrder> findByPaymentOrderReference(String paymentOrderReference);

    Optional<PaymentOrder> findByPaymentLinkId(String paymentLinkId);

    // Changed: userId -> userUserId, Long -> UUID
    List<PaymentOrder> findByUserUserId(UUID userId);

    // Changed: userId -> userUserId, Long -> UUID
    List<PaymentOrder> findByUserUserIdAndStatus(UUID userId, PaymentStatus status);

    List<PaymentOrder> findByStatus(PaymentStatus status);  // Also fixed: Payment -> PaymentStatus

    @Query("SELECT po FROM PaymentOrder po WHERE po.status = :status AND po.expiresAt < :now")
    List<PaymentOrder> findExpiredPaymentOrders(
            @Param("status") PaymentStatus status,
            @Param("now") LocalDateTime now);

    @Query("SELECT po FROM PaymentOrder po JOIN po.orders o WHERE o.orderId = :orderId")
    Optional<PaymentOrder> findByOrderOrderId(@Param("orderId") Long orderId);
}