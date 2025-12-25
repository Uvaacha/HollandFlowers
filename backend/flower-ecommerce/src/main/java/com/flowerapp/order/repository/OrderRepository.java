package com.flowerapp.order.repository;

import com.flowerapp.common.enums.OrderStatus;
import com.flowerapp.hebasePayment.domain.PaymentStatus;
import com.flowerapp.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    Optional<Order> findByOrderNumber(String orderNumber);

    boolean existsByOrderNumber(String orderNumber);

    // User-specific queries
    Page<Order> findByUserUserId(UUID userId, Pageable pageable);

    Page<Order> findByUserUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Page<Order> findByUserUserIdAndOrderStatus(UUID userId, OrderStatus orderStatus, Pageable pageable);

    List<Order> findByUserUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Order> findByOrderIdAndUserUserId(Long orderId, UUID userId);

    long countByUserUserId(UUID userId);

    // Status-based queries
    Page<Order> findByOrderStatus(OrderStatus orderStatus, Pageable pageable);

    Page<Order> findByPaymentStatus(PaymentStatus paymentStatus, Pageable pageable);

    List<Order> findByOrderStatusIn(List<OrderStatus> statuses);

    long countByOrderStatus(OrderStatus orderStatus);

    // All orders
    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // Date range queries
    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    Page<Order> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate,
                                       Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
    Page<Order> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                @Param("endDate") LocalDateTime endDate,
                                Pageable pageable);

    @Query("SELECT o FROM Order o WHERE o.user.userId = :userId AND o.createdAt BETWEEN :startDate AND :endDate")
    Page<Order> findByUserAndDateRange(@Param("userId") UUID userId,
                                       @Param("startDate") LocalDateTime startDate,
                                       @Param("endDate") LocalDateTime endDate,
                                       Pageable pageable);

    long countByCreatedAtAfter(LocalDateTime dateTime);

    // Statistics queries
    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderStatus = :status")
    long countByStatus(@Param("status") OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.orderStatus = 'DELIVERED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.orderStatus = 'DELIVERED' AND o.createdAt >= :startDate")
    BigDecimal getRevenueFromDate(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COALESCE(AVG(o.totalAmount), 0) FROM Order o WHERE o.orderStatus = 'DELIVERED'")
    BigDecimal getAverageOrderValue();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :startDate")
    long countOrdersFromDate(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.userId = :userId AND o.orderStatus = 'DELIVERED'")
    long countDeliveredOrdersByUser(@Param("userId") UUID userId);

    // Search queries
    @Query("SELECT o FROM Order o WHERE " +
            "(LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(o.recipientName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(o.recipientPhone) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Order> searchOrders(@Param("keyword") String keyword, Pageable pageable);

    // Update queries
    @Modifying
    @Query("UPDATE Order o SET o.orderStatus = :status WHERE o.orderId = :orderId")
    void updateOrderStatus(@Param("orderId") UUID orderId, @Param("status") OrderStatus status);

    @Modifying
    @Query("UPDATE Order o SET o.paymentStatus = :status WHERE o.orderId = :orderId")
    void updatePaymentStatus(@Param("orderId") UUID orderId, @Param("status") PaymentStatus status);

    @Modifying
    @Query("UPDATE Order o SET o.orderStatus = :orderStatus, o.paymentStatus = :paymentStatus WHERE o.orderId = :orderId")
    void updateOrderAndPaymentStatus(@Param("orderId") UUID orderId,
                                     @Param("orderStatus") OrderStatus orderStatus,
                                     @Param("paymentStatus") PaymentStatus paymentStatus);

    // Pending orders that need attention
    @Query("SELECT o FROM Order o WHERE o.orderStatus = 'PENDING' AND o.createdAt < :threshold ORDER BY o.createdAt ASC")
    List<Order> findStalePendingOrders(@Param("threshold") LocalDateTime threshold);

    // Orders for delivery today
//    @Query("SELECT o FROM Order o WHERE o.orderStatus IN ('CONFIRMED', 'PROCESSING') " +
//           "AND DATE(o.preferredDeliveryDate) = CURRENT_DATE ORDER BY o.preferredDeliveryDate ASC")
//    List<Order> findOrdersForDeliveryToday();

    @Query("SELECT o FROM Order o WHERE o.orderStatus IN ('CONFIRMED', 'PROCESSING') " +
            "AND o.preferredDeliveryDate >= :startOfDay AND o.preferredDeliveryDate < :endOfDay " +
            "ORDER BY o.preferredDeliveryDate ASC")
    List<Order> findOrdersForDeliveryToday(@Param("startOfDay") LocalDateTime startOfDay,
                                           @Param("endOfDay") LocalDateTime endOfDay);

    // Recent orders
    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    List<Order> findRecentOrders(Pageable pageable);

    // Count by payment status
    @Query("SELECT COUNT(o) FROM Order o WHERE o.paymentStatus = :status")
    long countByPaymentStatus(@Param("status") PaymentStatus status);

    Optional<Order> findById(Long orderId);

    // Customer statistics queries
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.user.userId = :userId AND o.orderStatus = 'DELIVERED'")
    java.math.BigDecimal calculateTotalSpentByUser(@Param("userId") UUID userId);

    @Query("SELECT MAX(o.createdAt) FROM Order o WHERE o.user.userId = :userId")
    Optional<LocalDateTime> findLastOrderDateByUser(@Param("userId") UUID userId);

    @Query("SELECT COUNT(DISTINCT o.user.userId) FROM Order o")
    long countDistinctCustomersWithOrders();
}