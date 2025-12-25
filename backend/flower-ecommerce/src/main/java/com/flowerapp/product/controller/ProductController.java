package com.flowerapp.product.controller;

import com.flowerapp.common.response.ApiResponse;
import com.flowerapp.product.dto.ProductDto.*;
import com.flowerapp.product.entity.Product;
import com.flowerapp.product.repository.ProductRepository;
import com.flowerapp.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Public product browsing endpoints")
public class ProductController {

    private final ProductService productService;

    private final ProductRepository productRepository;

    @GetMapping
    @Operation(summary = "Get all active products", description = "Returns paginated list of active products")
    public ResponseEntity<ApiResponse<Page<ProductListResponse>>> getAllProducts(
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ProductListResponse> products = productService.getAllActiveProducts(pageable);
        return ResponseEntity.ok(ApiResponse.success( "Products retrieved successfully", products));
    }

    @GetMapping("/{productId}")
    @Operation(summary = "Get product by ID", description = "Returns full product details")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable UUID productId) {
        ProductResponse product = productService.getProductById(productId);
        return ResponseEntity.ok(ApiResponse.success( "Product retrieved successfully", product));
    }

    @GetMapping("/sku/{sku}")
    @Operation(summary = "Get product by SKU", description = "Returns product details by SKU")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySku(@PathVariable String sku) {
        ProductResponse product = productService.getProductBySku(sku);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get products by category", description = "Returns products in a specific category")
    public ResponseEntity<ApiResponse<Page<ProductListResponse>>> getProductsByCategory(
            @PathVariable UUID categoryId,
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<ProductListResponse> products = productService.getProductsByCategory(categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
    }

    @Transactional(readOnly = true)
    public Page<ProductListResponse> searchProducts(ProductSearchRequest request, Pageable pageable) {

        Specification<Product> spec = Specification.where(isActive());

        if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
            spec = spec.and(keywordSearch(request.getKeyword()));
        }

        if (request.getCategoryId() != null) {
            spec = spec.and(inCategory(request.getCategoryId()));
        }

        if (request.getMinPrice() != null) {
            spec = spec.and(priceGreaterThanOrEqual(request.getMinPrice()));
        }

        if (request.getMaxPrice() != null) {
            spec = spec.and(priceLessThanOrEqual(request.getMaxPrice()));
        }

        if (request.getInStock() != null && request.getInStock()) {
            spec = spec.and(inStock());
        }

        if (request.getIsFeatured() != null && request.getIsFeatured()) {
            spec = spec.and(isFeatured());
        }

        if (request.getIsNewArrival() != null && request.getIsNewArrival()) {
            spec = spec.and(isNewArrival());
        }

        if (request.getIsBestSeller() != null && request.getIsBestSeller()) {
            spec = spec.and(isBestSeller());
        }

        Sort sort = buildSort(request.getSortBy(), request.getSortOrder());
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        return productRepository.findAll(spec, sortedPageable)
                .map(this::mapToListResponse);
    }

    private ProductListResponse mapToListResponse(Product product) {
        return ProductListResponse.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .imageUrl(product.getImageUrl())
                .actualPrice(product.getActualPrice())
                .offerPercentage(product.getOfferPercentage())
                .finalPrice(product.getFinalPrice())
                .categoryName(product.getCategory().getCategoryName())
                .inStock(product.isInStock())
                .isFeatured(product.getIsFeatured())
                .isNewArrival(product.getIsNewArrival())
                .isBestSeller(product.getIsBestSeller())
                .build();
    }

    private Sort buildSort(String sortBy, String sortDirection) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        String sortField = switch (sortBy != null ? sortBy.toLowerCase() : "createdat") {
            case "price" -> "finalPrice";
            case "name" -> "productName";
            case "createdat", "created" -> "createdAt";
            default -> "createdAt";
        };

        return Sort.by(direction, sortField);
    }

    // Specification methods
    private Specification<Product> isActive() {
        return (root, query, cb) -> cb.isTrue(root.get("isActive"));
    }

    private Specification<Product> keywordSearch(String keyword) {
        return (root, query, cb) -> {
            String pattern = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("productName")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern),
                    cb.like(cb.lower(root.get("tags")), pattern)
            );
        };
    }

    private Specification<Product> inCategory(UUID categoryId) {
        return (root, query, cb) -> cb.equal(root.get("category").get("categoryId"), categoryId);
    }

    private Specification<Product> priceGreaterThanOrEqual(BigDecimal minPrice) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("finalPrice"), minPrice);
    }

    private Specification<Product> priceLessThanOrEqual(BigDecimal maxPrice) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("finalPrice"), maxPrice);
    }

    private Specification<Product> inStock() {
        return (root, query, cb) -> cb.greaterThan(root.get("stockQuantity"), 0);
    }

    private Specification<Product> isFeatured() {
        return (root, query, cb) -> cb.isTrue(root.get("isFeatured"));
    }

    private Specification<Product> isNewArrival() {
        return (root, query, cb) -> cb.isTrue(root.get("isNewArrival"));
    }

    private Specification<Product> isBestSeller() {
        return (root, query, cb) -> cb.isTrue(root.get("isBestSeller"));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured products", description = "Returns featured products")
    public ResponseEntity<ApiResponse<List<ProductListResponse>>> getFeaturedProducts(
            @RequestParam(defaultValue = "8") int limit) {
        List<ProductListResponse> products = productService.getFeaturedProducts(limit);
        return ResponseEntity.ok(ApiResponse.success("Featured products retrieved successfully", products));
    }

    @GetMapping("/new-arrivals")
    @Operation(summary = "Get new arrival products", description = "Returns products marked as new arrivals")
    public ResponseEntity<ApiResponse<List<ProductListResponse>>> getNewArrivalProducts(
            @RequestParam(defaultValue = "8") int limit) {
        List<ProductListResponse> products = productService.getNewArrivalProducts(limit);
        return ResponseEntity.ok(ApiResponse.success("New arrival products retrieved successfully", products));
    }

    @GetMapping("/best-sellers")
    @Operation(summary = "Get best seller products", description = "Returns products marked as best sellers")
    public ResponseEntity<ApiResponse<List<ProductListResponse>>> getBestSellerProducts(
            @RequestParam(defaultValue = "8") int limit) {
        List<ProductListResponse> products = productService.getBestSellerProducts(limit);
        return ResponseEntity.ok(ApiResponse.success("Best seller products retrieved successfully", products));
    }

    @GetMapping("/latest")
    @Operation(summary = "Get latest products", description = "Returns newest products")
    public ResponseEntity<ApiResponse<List<ProductListResponse>>> getLatestProducts(
            @RequestParam(defaultValue = "8") int limit) {
        List<ProductListResponse> products = productService.getLatestProducts(limit);
        return ResponseEntity.ok(ApiResponse.success( "Latest products retrieved successfully", products));
    }

    @GetMapping("/on-sale")
    @Operation(summary = "Get products on sale", description = "Returns products with offers")
    public ResponseEntity<ApiResponse<List<ProductListResponse>>> getProductsOnSale(
            @RequestParam(defaultValue = "8") int limit) {
        List<ProductListResponse> products = productService.getProductsOnSale(limit);
        return ResponseEntity.ok(ApiResponse.success( "Sale products retrieved successfully", products));
    }
}