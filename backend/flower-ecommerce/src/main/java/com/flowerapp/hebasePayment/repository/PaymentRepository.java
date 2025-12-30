package com.flowerapp.hebasePayment.repository;

import com.flowerapp.hebasePayment.domain.PaymentMethod;
import com.flowerapp.hebasePayment.domain.PaymentStatus;
import com.flowerapp.hebasePayment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByPaymentReference(String paymentReference);

    Optional<Payment> findByHesabePaymentId(String hesabePaymentId);

    List<Payment> findByOrderOrderId(Long orderId);

    // Find single payment by orderId (most recent)
    @Query("SELECT p FROM Payment p WHERE p.order.orderId = :orderId ORDER BY p.createdAt DESC LIMIT 1")
    Optional<Payment> findLatestByOrderOrderId(@Param("orderId") Long orderId);

    // Find payment by order number
    @Query("SELECT p FROM Payment p WHERE p.order.orderNumber = :orderNumber ORDER BY p.createdAt DESC LIMIT 1")
    Optional<Payment> findByOrderOrderNumber(@Param("orderNumber") String orderNumber);

    @Query("SELECT p FROM Payment p WHERE p.status = :status AND p.createdAt < :expiryTime")
    List<Payment> findExpiredPendingPayments(
            @Param("status") PaymentStatus status,
            @Param("expiryTime") LocalDateTime expiryTime);

    @Query("SELECT p FROM Payment p WHERE p.order.orderId = :orderId ORDER BY p.createdAt DESC")
    List<Payment> findPaymentsByOrderIdOrderByCreatedAtDesc(@Param("orderId") Long orderId);

    @Query("SELECT p FROM Payment p WHERE p.user.userId = :userId ORDER BY p.createdAt DESC")
    List<Payment> findRecentPaymentsByUserId(@Param("userId") UUID userId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = :status AND p.createdAt BETWEEN :startDate AND :endDate")
    Double getTotalAmountByStatusAndDateRange(
            @Param("status") PaymentStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = :status AND p.paymentMethod = :method")
    Long countByStatusAndPaymentMethod(
            @Param("status") PaymentStatus status,
            @Param("method") PaymentMethod method);

    boolean existsByPaymentReference(String paymentReference);
}