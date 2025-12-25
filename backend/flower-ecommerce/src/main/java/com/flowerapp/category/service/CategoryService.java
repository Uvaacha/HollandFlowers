package com.flowerapp.category.service;

import com.flowerapp.category.dto.CategoryDto.*;
import com.flowerapp.category.entity.Category;
import com.flowerapp.category.repository.CategoryRepository;
import com.flowerapp.common.exception.CustomException;
import com.flowerapp.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllActiveCategories() {
        log.info("Fetching all active categories");
        return categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<CategoryResponse> getAllCategories(Pageable pageable) {
        log.info("Fetching all categories with pagination");
        return categoryRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(UUID categoryId) {
        log.info("Fetching category by ID: {}", categoryId);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> CustomException.notFound("Category"));
        return mapToResponse(category);
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryByName(String categoryName) {
        log.info("Fetching category by name: {}", categoryName);
        Category category = categoryRepository.findByCategoryName(categoryName)
                .orElseThrow(() -> CustomException.notFound("Category"));
        return mapToResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        log.info("Creating new category: {}", request.getCategoryName());

        if (categoryRepository.existsByCategoryName(request.getCategoryName())) {
            throw new CustomException("Category already exists", HttpStatus.CONFLICT, "CATEGORY_EXISTS");
        }

        Integer maxOrder = categoryRepository.findMaxDisplayOrder();
        int displayOrder = request.getDisplayOrder() != null 
                ? request.getDisplayOrder() 
                : (maxOrder != null ? maxOrder + 1 : 0);

        Category category = Category.builder()
                .categoryName(request.getCategoryName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .displayOrder(displayOrder)
                .isActive(true)
                .build();

        category = categoryRepository.save(category);
        log.info("Category created with ID: {}", category.getCategoryId());

        return mapToResponse(category);
    }

    @Transactional
    public CategoryResponse updateCategory(UUID categoryId, UpdateCategoryRequest request) {
        log.info("Updating category: {}", categoryId);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> CustomException.notFound("Category"));

        if (request.getCategoryName() != null && !request.getCategoryName().isBlank()) {
            if (categoryRepository.existsByCategoryNameAndCategoryIdNot(
                    request.getCategoryName(), categoryId)) {
                throw new CustomException("Category name already in use", 
                        HttpStatus.CONFLICT, "CATEGORY_NAME_EXISTS");
            }
            category.setCategoryName(request.getCategoryName());
        }

        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }

        if (request.getImageUrl() != null) {
            category.setImageUrl(request.getImageUrl());
        }

        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }

        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }

        category = categoryRepository.save(category);
        log.info("Category updated: {}", categoryId);

        return mapToResponse(category);
    }

    @Transactional
    public void deleteCategory(UUID categoryId) {
        log.info("Deleting category: {}", categoryId);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> CustomException.notFound("Category"));

        // Check if category has products
        long productCount = productRepository.countByCategoryCategoryId(categoryId);
        if (productCount > 0) {
            throw new CustomException(
                    "Cannot delete category with existing products. Deactivate it instead.",
                    HttpStatus.CONFLICT,
                    "CATEGORY_HAS_PRODUCTS"
            );
        }

        categoryRepository.delete(category);
        log.info("Category deleted: {}", categoryId);
    }

    @Transactional
    public CategoryResponse toggleCategoryStatus(UUID categoryId) {
        log.info("Toggling category status: {}", categoryId);

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> CustomException.notFound("Category"));

        category.setIsActive(!category.getIsActive());
        category = categoryRepository.save(category);

        log.info("Category {} is now {}", categoryId, category.getIsActive() ? "active" : "inactive");
        return mapToResponse(category);
    }

    @Transactional(readOnly = true)
    public Page<CategoryResponse> searchCategories(String search, Pageable pageable) {
        log.info("Searching categories with term: {}", search);
        return categoryRepository.searchCategories(search, pageable)
                .map(this::mapToResponse);
    }

    private CategoryResponse mapToResponse(Category category) {
        Long productCount = productRepository.countByCategoryCategoryId(category.getCategoryId());
        
        return CategoryResponse.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .displayOrder(category.getDisplayOrder())
                .isActive(category.getIsActive())
                .productCount(productCount)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
