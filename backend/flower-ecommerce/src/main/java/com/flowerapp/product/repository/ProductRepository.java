package com.flowerapp.product.repository;

import com.flowerapp.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySku(String sku);

    boolean existsBySku(String sku);

    boolean existsBySkuAndProductIdNot(String sku, UUID productId);

    Page<Product> findByIsActiveTrue(Pageable pageable);

    Page<Product> findByCategoryCategoryId(UUID categoryId, Pageable pageable);

    Page<Product> findByCategoryCategoryIdAndIsActiveTrue(UUID categoryId, Pageable pageable);

    // Featured products
    List<Product> findByIsFeaturedTrueAndIsActiveTrue();

    Page<Product> findByIsFeaturedTrueAndIsActiveTrue(Pageable pageable);

    // New Arrival products
    List<Product> findByIsNewArrivalTrueAndIsActiveTrue();

    Page<Product> findByIsNewArrivalTrueAndIsActiveTrue(Pageable pageable);

    // Best Seller products
    List<Product> findByIsBestSellerTrueAndIsActiveTrue();

    Page<Product> findByIsBestSellerTrueAndIsActiveTrue(Pageable pageable);

    long countByCategoryCategoryId(UUID categoryId);

    long countByIsActiveTrue();

    // Count featured, new arrivals, best sellers
    long countByIsFeaturedTrueAndIsActiveTrue();

    long countByIsNewArrivalTrueAndIsActiveTrue();

    long countByIsBestSellerTrueAndIsActiveTrue();

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
            "(LOWER(p.productName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.tags) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.category.categoryId = :categoryId AND " +
            "(LOWER(p.productName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProductsInCategory(@Param("categoryId") UUID categoryId,
                                           @Param("keyword") String keyword,
                                           Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
            "p.finalPrice BETWEEN :minPrice AND :maxPrice")
    Page<Product> findByPriceRange(@Param("minPrice") BigDecimal minPrice,
                                   @Param("maxPrice") BigDecimal maxPrice,
                                   Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.stockQuantity > 0")
    Page<Product> findInStockProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.stockQuantity <= :threshold")
    List<Product> findLowStockProducts(@Param("threshold") int threshold);

    @Modifying
    @Query("UPDATE Product p SET p.stockQuantity = p.stockQuantity - :quantity WHERE p.productId = :productId AND p.stockQuantity >= :quantity")
    int decreaseStock(@Param("productId") UUID productId, @Param("quantity") int quantity);

    @Modifying
    @Query("UPDATE Product p SET p.stockQuantity = p.stockQuantity + :quantity WHERE p.productId = :productId")
    int increaseStock(@Param("productId") UUID productId, @Param("quantity") int quantity);

    @Modifying
    @Query("UPDATE Product p SET p.isActive = :isActive WHERE p.productId = :productId")
    void updateActiveStatus(@Param("productId") UUID productId, @Param("isActive") Boolean isActive);

    @Modifying
    @Query("UPDATE Product p SET p.isFeatured = :isFeatured WHERE p.productId = :productId")
    void updateFeaturedStatus(@Param("productId") UUID productId, @Param("isFeatured") Boolean isFeatured);

    @Modifying
    @Query("UPDATE Product p SET p.isNewArrival = :isNewArrival WHERE p.productId = :productId")
    void updateNewArrivalStatus(@Param("productId") UUID productId, @Param("isNewArrival") Boolean isNewArrival);

    @Modifying
    @Query("UPDATE Product p SET p.isBestSeller = :isBestSeller WHERE p.productId = :productId")
    void updateBestSellerStatus(@Param("productId") UUID productId, @Param("isBestSeller") Boolean isBestSeller);

    @Query("SELECT p FROM Product p WHERE p.isActive = true ORDER BY p.createdAt DESC")
    List<Product> findLatestProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.offerPercentage > 0 ORDER BY p.offerPercentage DESC")
    List<Product> findProductsOnSale(Pageable pageable);
}