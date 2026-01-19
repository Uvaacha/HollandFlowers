package com.flowerapp.review.repository;

import com.flowerapp.review.entity.ProductReview;
import com.flowerapp.review.entity.ProductReview.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    Page<ProductReview> findByProductProductIdAndStatus(
            UUID productId,
            ReviewStatus status,
            Pageable pageable
    );

    Page<ProductReview> findByProductProductId(UUID productId, Pageable pageable);

    Page<ProductReview> findByUserUserId(UUID userId, Pageable pageable);

    boolean existsByProductProductIdAndUserUserId(UUID productId, UUID userId);

    boolean existsByProductProductIdAndUserUserIdAndOrderOrderId(
            UUID productId,
            UUID userId,
            Long orderId
    );

    @Query("SELECT AVG(r.rating) FROM ProductReview r WHERE r.product.productId = :productId AND r.status = :status")
    Double getAverageRating(@Param("productId") UUID productId, @Param("status") ReviewStatus status);

    Long countByProductProductIdAndStatus(UUID productId, ReviewStatus status);

    @Query("SELECT r.rating, COUNT(r) FROM ProductReview r WHERE r.product.productId = :productId AND r.status = :status GROUP BY r.rating")
    List<Object[]> getRatingDistribution(@Param("productId") UUID productId, @Param("status") ReviewStatus status);

    Page<ProductReview> findByStatus(ReviewStatus status, Pageable pageable);

    List<ProductReview> findByOrderOrderId(Long orderId);

    Page<ProductReview> findByStatusOrderByCreatedAtDesc(ReviewStatus status, Pageable pageable);
}