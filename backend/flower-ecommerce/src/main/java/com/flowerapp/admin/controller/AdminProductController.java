package com.flowerapp.admin.controller;

import com.flowerapp.common.response.ApiResponse;
import com.flowerapp.product.dto.ProductDto.*;
import com.flowerapp.product.entity.Product;
import com.flowerapp.product.repository.ProductRepository;
import com.flowerapp.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/products")
@RequiredArgsConstructor
@Tag(name = "Admin Product Management", description = "Product management for admins")
@SecurityRequirement(name = "bearerAuth")
public class AdminProductController {

    private final ProductService productService;
    private final ProductRepository productRepository;

    // ==================== READ Operations (ADMIN & SUPER_ADMIN) ====================

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get all products (including inactive)")
    public ResponseEntity<ApiResponse<Page<ProductListResponse>>> getAllProducts(
            @PageableDefault(size = 10) Pageable pageable) {

        Page<ProductListResponse> products = productService.getAllProducts(pageable);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Search products with filters", description = "Search products by keyword, category, and other filters")
    public ResponseEntity<ApiResponse<Page<ProductListResponse>>> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false) Boolean isFeatured,
            @RequestParam(required = false) Boolean isNewArrival,
            @RequestParam(required = false) Boolean isBestSeller,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @PageableDefault(size = 10) Pageable pageable) {

        // Build specification for filtering
        Specification<Product> spec = Specification.where(null);

        // Keyword search (name, description, SKU, tags)
        if (keyword != null && !keyword.isBlank()) {
            String pattern = "%" + keyword.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("productName")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern),
                    cb.like(cb.lower(root.get("sku")), pattern),
                    cb.like(cb.lower(root.get("tags")), pattern)
            ));
        }

        // Category filter
        if (categoryId != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("category").get("categoryId"), categoryId));
        }

        // Price range filter
        if (minPrice != null) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThanOrEqualTo(root.get("actualPrice"), minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and((root, query, cb) ->
                    cb.lessThanOrEqualTo(root.get("actualPrice"), maxPrice));
        }

        // Stock filter
        if (inStock != null && inStock) {
            spec = spec.and((root, query, cb) ->
                    cb.greaterThan(root.get("stockQuantity"), 0));
        }

        // Featured filter
        if (isFeatured != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("isFeatured"), isFeatured));
        }

        // New Arrival filter
        if (isNewArrival != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("isNewArrival"), isNewArrival));
        }

        // Best Seller filter
        if (isBestSeller != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("isBestSeller"), isBestSeller));
        }

        // Active status filter
        if (isActive != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("isActive"), isActive));
        }

        // Build sort
        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        String sortField = mapSortField(sortBy);
        Sort sort = Sort.by(direction, sortField);

        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                sort
        );

        // Execute query
        Page<Product> productsPage = productRepository.findAll(spec, sortedPageable);
        Page<ProductListResponse> responsePage = productsPage.map(this::mapToListResponse);

        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", responsePage));
    }

    @GetMapping("/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable UUID productId) {
        ProductResponse product = productService.getProductById(productId);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
    }

    @GetMapping("/sku/{sku}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get product by SKU")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySku(@PathVariable String sku) {
        ProductResponse product = productService.getProductBySku(sku);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
    }

    @GetMapping("/category/{categoryId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get products by category (including inactive)")
    public ResponseEntity<ApiResponse<Page<ProductListResponse>>> getProductsByCategory(
            @PathVariable UUID categoryId,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<ProductListResponse> products = productService.getAllProductsByCategory(categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get low stock products")
    public ResponseEntity<ApiResponse<List<ProductListResponse>>> getLowStockProducts(
            @RequestParam(defaultValue = "10") int threshold) {

        List<ProductListResponse> products = productService.getLowStockProducts(threshold);
        return ResponseEntity.ok(ApiResponse.success("Low stock products retrieved", products));
    }

    // ==================== WRITE Operations (SUPER_ADMIN only) ====================

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a new product (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody CreateProductRequest request) {

        ProductResponse product = productService.createProduct(request);
        return ResponseEntity.ok(ApiResponse.success("Product created successfully", product));
    }

    @PutMapping("/{productId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update a product (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateProductRequest request) {

        ProductResponse product = productService.updateProduct(productId, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
    }

    @DeleteMapping("/{productId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete a product (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable UUID productId) {
        productService.deleteProduct(productId);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    @PutMapping("/{productId}/toggle-status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Toggle product active status (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<ProductResponse>> toggleProductStatus(
            @PathVariable UUID productId) {

        ProductResponse product = productService.toggleProductStatus(productId);
        return ResponseEntity.ok(ApiResponse.success("Product status updated", product));
    }

    @PutMapping("/{productId}/toggle-featured")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Toggle product featured status (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<ProductResponse>> toggleFeatured(@PathVariable UUID productId) {
        ProductResponse product = productService.toggleFeatured(productId);
        return ResponseEntity.ok(ApiResponse.success("Featured status toggled successfully", product));
    }

    @PutMapping("/{productId}/toggle-new-arrival")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Toggle product new arrival status (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<ProductResponse>> toggleNewArrival(@PathVariable UUID productId) {
        ProductResponse product = productService.toggleNewArrival(productId);
        return ResponseEntity.ok(ApiResponse.success("New arrival status toggled successfully", product));
    }

    @PutMapping("/{productId}/toggle-best-seller")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Toggle product best seller status (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<ProductResponse>> toggleBestSeller(@PathVariable UUID productId) {
        ProductResponse product = productService.toggleBestSeller(productId);
        return ResponseEntity.ok(ApiResponse.success("Best seller status toggled successfully", product));
    }

    @PutMapping("/{productId}/stock")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update product stock (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStock(
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateStockRequest request) {

        ProductResponse product = productService.updateStock(productId, request);
        return ResponseEntity.ok(ApiResponse.success("Stock updated successfully", product));
    }

    // ==================== Helper Methods ====================

    private String mapSortField(String sortBy) {
        return switch (sortBy != null ? sortBy.toLowerCase() : "createdat") {
            case "price", "actualprice" -> "actualPrice";
            case "name", "productname" -> "productName";
            case "stock", "stockquantity" -> "stockQuantity";
            case "category" -> "category.categoryName";
            case "sku" -> "sku";
            case "createdat", "created" -> "createdAt";
            case "updatedat", "updated" -> "updatedAt";
            default -> "createdAt";
        };
    }

    private ProductListResponse mapToListResponse(Product product) {
        return ProductListResponse.builder()
                .productId(product.getProductId())
                .categoryId(product.getCategory().getCategoryId())
                .productName(product.getProductName())
                .sku(product.getSku())
                .imageUrl(product.getImageUrl())
                .actualPrice(product.getActualPrice())
                .offerPercentage(product.getOfferPercentage())
                .finalPrice(product.getFinalPrice())
                .categoryName(product.getCategory().getCategoryName())
                .stockQuantity(product.getStockQuantity())
                .inStock(product.isInStock())
                .isActive(product.getIsActive())
                .isFeatured(product.getIsFeatured())
                .isNewArrival(product.getIsNewArrival())
                .isBestSeller(product.getIsBestSeller())
                .tags(product.getTags())
                .build();
    }
}