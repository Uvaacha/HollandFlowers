package com.flowerapp.category.controller;

import com.flowerapp.category.dto.CategoryDto.CategoryResponse;
import com.flowerapp.category.service.CategoryService;
import com.flowerapp.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Tag(name = "Categories (Public)", description = "Public category browsing APIs")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get all active categories", description = "Retrieve all active categories for browsing")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        log.info("Fetching all active categories");
        List<CategoryResponse> categories = categoryService.getAllActiveCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/{categoryId}")
    @Operation(summary = "Get category by ID", description = "Retrieve a specific category by its ID")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(
            @PathVariable UUID categoryId) {
        log.info("Fetching category: {}", categoryId);
        CategoryResponse category = categoryService.getCategoryById(categoryId);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @GetMapping("/name/{categoryName}")
    @Operation(summary = "Get category by name", description = "Retrieve a specific category by its name")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryByName(
            @PathVariable String categoryName) {
        log.info("Fetching category by name: {}", categoryName);
        CategoryResponse category = categoryService.getCategoryByName(categoryName);
        return ResponseEntity.ok(ApiResponse.success(category));
    }
}
