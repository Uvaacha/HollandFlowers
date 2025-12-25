package com.flowerapp.category.repository;

import com.flowerapp.category.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    Optional<Category> findByCategoryName(String categoryName);

    boolean existsByCategoryName(String categoryName);

    boolean existsByCategoryNameAndCategoryIdNot(String categoryName, UUID categoryId);

    List<Category> findByIsActiveTrueOrderByDisplayOrderAsc();

    Page<Category> findByIsActive(Boolean isActive, Pageable pageable);
    
    long countByIsActiveTrue();

    @Query("SELECT c FROM Category c ORDER BY c.displayOrder ASC, c.categoryName ASC")
    List<Category> findAllOrdered();

    @Query("SELECT c FROM Category c WHERE LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Category> searchCategories(@Param("search") String search, Pageable pageable);

    @Query("SELECT c FROM Category c WHERE c.isActive = true AND " +
           "LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Category> searchActiveCategories(@Param("search") String search);

    @Query("SELECT MAX(c.displayOrder) FROM Category c")
    Integer findMaxDisplayOrder();
}
