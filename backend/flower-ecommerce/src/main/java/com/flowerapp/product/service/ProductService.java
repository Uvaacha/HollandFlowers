package com.flowerapp.product.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowerapp.category.entity.Category;
import com.flowerapp.category.repository.CategoryRepository;
import com.flowerapp.common.exception.CustomException;
import com.flowerapp.product.dto.ProductDto.*;
import com.flowerapp.product.entity.Product;
import com.flowerapp.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public Page<ProductListResponse> getAllActiveProducts(Pageable pageable) {
        log.info("Fetching all active products");
        return productRepository.findByIsActiveTrue(pageable)
                .map(this::mapToListResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductListResponse> getAllProducts(Pageable pageable) {
        log.info("Fetching all products (including inactive)");
        return productRepository.findAll(pageable)
                .map(this::mapToListResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductListResponse> getProductsByCategory(UUID categoryId, Pageable pageable) {
        log.info("Fetching products for category: {}", categoryId);
        return productRepository.findByCategoryCategoryIdAndIsActiveTrue(categoryId, pageable)
                .map(this::mapToListResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductListResponse> getAllProductsByCategory(UUID categoryId, Pageable pageable) {
        log.info("Fetching all products for category (including inactive): {}", categoryId);
        return productRepository.findByCategoryCategoryId(categoryId, pageable)
                .map(this::mapToListResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID productId) {
        log.info("Fetching product: {}", productId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> CustomException.notFound("Product"));
        return mapToResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductBySku(String sku) {
        log.info("Fetching product by SKU: {}", sku);
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> CustomException.notFound("Product"));
        return mapToResponse(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductListResponse> searchProducts(String keyword, Pageable pageable) {
        log.info("Searching products with keyword: {}", keyword);
        return productRepository.searchProducts(keyword, pageable)
                .map(this::mapToListResponse);
    }

    @Transactional(readOnly = true)
    public List<ProductListResponse> getFeaturedProducts(int limit) {
        log.info("Fetching featured products, limit: {}", limit);
        Pageable pageable = PageRequest.of(0, limit);
        return productRepository.findByIsFeaturedTrueAndIsActiveTrue(pageable)
                .map(this::mapToListResponse)
                .getContent();
    }

    @Transactional(readOnly = true)
    public List<ProductListResponse> getNewArrivalProducts(int limit) {
        log.info("Fetching new arrival products, limit: {}", limit);
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        return productRepository.findByIsNewArrivalTrueAndIsActiveTrue(pageable)
                .map(this::mapToListResponse)
                .getContent();
    }

    @Transactional(readOnly = true)
    public List<ProductListResponse> getBestSellerProducts(int limit) {
        log.info("Fetching best seller products, limit: {}", limit);
        Pageable pageable = PageRequest.of(0, limit);
        return productRepository.findByIsBestSellerTrueAndIsActiveTrue(pageable)
                .map(this::mapToListResponse)
                .getContent();
    }

    @Transactional(readOnly = true)
    public List<ProductListResponse> getLatestProducts(int limit) {
        log.info("Fetching latest products, limit: {}", limit);
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        return productRepository.findLatestProducts(pageable)
                .stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductListResponse> getProductsOnSale(int limit) {
        log.info("Fetching products on sale, limit: {}", limit);
        Pageable pageable = PageRequest.of(0, limit);
        return productRepository.findProductsOnSale(pageable)
                .stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        log.info("Creating product: {}", request.getProductName());

        // Validate category
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> CustomException.notFound("Category"));

        // Check SKU uniqueness
        if (request.getSku() != null && productRepository.existsBySku(request.getSku())) {
            throw new CustomException("SKU already exists", HttpStatus.CONFLICT, "SKU_EXISTS");
        }

        Product product = Product.builder()
                .category(category)
                .productName(request.getProductName())
                .imageUrl(request.getImageUrl())
                .additionalImages(serializeImages(request.getAdditionalImages()))
                .actualPrice(request.getActualPrice())
                .offerPercentage(request.getOfferPercentage())
                .description(request.getDescription())
                .shortDescription(request.getShortDescription())
                .stockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0)
                .sku(request.getSku())
                .isActive(true)
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .isNewArrival(request.getIsNewArrival() != null ? request.getIsNewArrival() : false)
                .isBestSeller(request.getIsBestSeller() != null ? request.getIsBestSeller() : false)
                .tags(request.getTags())
                .build();

        product = productRepository.save(product);
        log.info("Product created with ID: {}", product.getProductId());

        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(UUID productId, UpdateProductRequest request) {
        log.info("Updating product: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> CustomException.notFound("Product"));

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> CustomException.notFound("Category"));
            product.setCategory(category);
        }

        if (request.getProductName() != null) {
            product.setProductName(request.getProductName());
        }

        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }

        if (request.getAdditionalImages() != null) {
            product.setAdditionalImages(serializeImages(request.getAdditionalImages()));
        }

        if (request.getActualPrice() != null) {
            product.setActualPrice(request.getActualPrice());
        }

        if (request.getOfferPercentage() != null) {
            product.setOfferPercentage(request.getOfferPercentage());
        }

        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }

        if (request.getShortDescription() != null) {
            product.setShortDescription(request.getShortDescription());
        }

        if (request.getStockQuantity() != null) {
            product.setStockQuantity(request.getStockQuantity());
        }

        if (request.getSku() != null) {
            if (productRepository.existsBySkuAndProductIdNot(request.getSku(), productId)) {
                throw new CustomException("SKU already exists", HttpStatus.CONFLICT, "SKU_EXISTS");
            }
            product.setSku(request.getSku());
        }

        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }

        if (request.getIsFeatured() != null) {
            product.setIsFeatured(request.getIsFeatured());
        }

        if (request.getIsNewArrival() != null) {
            product.setIsNewArrival(request.getIsNewArrival());
        }

        if (request.getIsBestSeller() != null) {
            product.setIsBestSeller(request.getIsBestSeller());
        }

        if (request.getTags() != null) {
            product.setTags(request.getTags());
        }

        product = productRepository.save(product);
        log.info("Product updated: {}", productId);

        return mapToResponse(product);
    }

    @Transactional
    public void deleteProduct(UUID productId) {
        log.info("Deleting product: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> CustomException.notFound("Product"));

        productRepository.delete(product);
        log.info("Product deleted: {}", productId);
    }

    @Transactional
    public ProductResponse updateStock(UUID productId, UpdateStockRequest request) {
        log.info("Updating stock for product: {}, operation: {}, quantity: {}",
                productId, request.getOperation(), request.getQuantity());

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> CustomException.notFound("Product"));

        switch (request.getOperation().toUpperCase()) {
            case "ADD" -> product.increaseStock(request.getQuantity());
            case "SUBTRACT" -> {
                if (product.getStockQuantity() < request.getQuantity()) {
                    throw CustomException.badRequest("Insufficient stock");
                }
                product.decreaseStock(request.getQuantity());
            }
            case "SET" -> product.setStockQuantity(request.getQuantity());
            default -> throw CustomException.badRequest("Invalid operation");
        }

        product = productRepository.save(product);
        log.info("Stock updated for product: {}", productId);

        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse toggleProductStatus(UUID productId) {
        log.info("Toggling product status: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> CustomException.notFound("Product"));

        product.setIsActive(!product.getIsActive());
        product = productRepository.save(product);

        log.info("Product {} is now {}", productId, product.getIsActive() ? "active" : "inactive");
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse toggleFeatured(UUID productId) {
        log.info("Toggling featured status: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> CustomException.notFound("Product"));

        product.setIsFeatured(!product.getIsFeatured());
        product = productRepository.save(product);

        log.info("Product {} featured is now {}", productId, product.getIsFeatured());
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse toggleNewArrival(UUID productId) {
        log.info("Toggling new arrival status: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> CustomException.notFound("Product"));

        product.setIsNewArrival(!product.getIsNewArrival());
        product = productRepository.save(product);

        log.info("Product {} new arrival is now {}", productId, product.getIsNewArrival());
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse toggleBestSeller(UUID productId) {
        log.info("Toggling best seller status: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> CustomException.notFound("Product"));

        product.setIsBestSeller(!product.getIsBestSeller());
        product = productRepository.save(product);

        log.info("Product {} best seller is now {}", productId, product.getIsBestSeller());
        return mapToResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductListResponse> getLowStockProducts(int threshold) {
        log.info("Fetching low stock products with threshold: {}", threshold);
        return productRepository.findLowStockProducts(threshold)
                .stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    private String serializeImages(List<String> images) {
        if (images == null || images.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(images);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize images", e);
            return null;
        }
    }

    private List<String> deserializeImages(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize images", e);
            return Collections.emptyList();
        }
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .productId(product.getProductId())
                .categoryId(product.getCategory().getCategoryId())
                .categoryName(product.getCategory().getCategoryName())
                .productName(product.getProductName())
                .imageUrl(product.getImageUrl())
                .additionalImages(deserializeImages(product.getAdditionalImages()))
                .actualPrice(product.getActualPrice())
                .offerPercentage(product.getOfferPercentage())
                .finalPrice(product.getFinalPrice())
                .description(product.getDescription())
                .shortDescription(product.getShortDescription())
                .stockQuantity(product.getStockQuantity())
                .inStock(product.isInStock())
                .sku(product.getSku())
                .isActive(product.getIsActive())
                .isFeatured(product.getIsFeatured())
                .isNewArrival(product.getIsNewArrival())
                .isBestSeller(product.getIsBestSeller())
                .tags(product.getTags())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
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