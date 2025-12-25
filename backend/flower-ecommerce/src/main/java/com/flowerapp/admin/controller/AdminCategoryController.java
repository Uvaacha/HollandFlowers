package com.flowerapp.admin.controller;

import com.flowerapp.category.dto.CategoryDto.*;
import com.flowerapp.category.service.CategoryService;
import com.flowerapp.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/categories")
@RequiredArgsConstructor
@Tag(name = "Admin Category Management", description = "Category management for admins")
@SecurityRequirement(name = "bearerAuth")
public class AdminCategoryController {

    private final CategoryService categoryService;

    // ==================== READ Operations (ADMIN & SUPER_ADMIN) ====================

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get all categories (including inactive)")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        List<CategoryResponse> categories = categoryService
                .getAllCategories(Pageable.unpaged())
                .getContent();
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Search categories")
    public ResponseEntity<ApiResponse<Page<CategoryResponse>>> searchCategories(
            @RequestParam String keyword,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<CategoryResponse> categories = categoryService.searchCategories(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }

    // ==================== WRITE Operations (SUPER_ADMIN only) ====================

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a new category (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CreateCategoryRequest request) {

        CategoryResponse category = categoryService.createCategory(request);
        return ResponseEntity.ok(ApiResponse.success("Category created successfully", category));
    }

    @PutMapping("/{categoryId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update a category (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable UUID categoryId,
            @Valid @RequestBody UpdateCategoryRequest request) {

        CategoryResponse category = categoryService.updateCategory(categoryId, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", category));
    }

    @DeleteMapping("/{categoryId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete a category (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID categoryId) {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }

    @PutMapping("/{categoryId}/toggle-status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Toggle category active status (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<CategoryResponse>> toggleCategoryStatus(
            @PathVariable UUID categoryId) {

        CategoryResponse category = categoryService.toggleCategoryStatus(categoryId);
        return ResponseEntity.ok(ApiResponse.success("Category status updated", category));
    }
}