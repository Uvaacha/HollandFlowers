package com.flowerapp.order.repository;

import com.flowerapp.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    List<OrderItem> findByOrderOrderId(Long orderId);

    List<OrderItem> findByProductProductId(UUID productId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.user.userId = :userId")
    List<OrderItem> findByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.product.productId = :productId")
    long countByProductId(@Param("productId") UUID productId);

    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.product.productId = :productId " +
            "AND oi.order.deliveryStatus = 'DELIVERED'")
    Long getTotalSoldQuantity(@Param("productId") UUID productId);

    @Query("SELECT oi.product.productId, SUM(oi.quantity) as totalQty FROM OrderItem oi " +
            "WHERE oi.order.deliveryStatus = 'DELIVERED' " +
            "GROUP BY oi.product.productId ORDER BY totalQty DESC")
    List<Object[]> findBestSellingProducts();

    void deleteByOrderOrderId(Long orderId);

    int countByOrderOrderId(Long orderId);
}