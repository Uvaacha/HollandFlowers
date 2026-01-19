package com.flowerapp.review.service;

import com.flowerapp.review.dto.*;
import com.flowerapp.review.entity.ProductReview;
import com.flowerapp.review.entity.ProductReview.ReviewStatus;
import com.flowerapp.review.repository.ProductReviewRepository;
import com.flowerapp.product.entity.Product;
import com.flowerapp.product.repository.ProductRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductReviewService {

    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public ReviewResponseDto submitReview(ReviewRequestDto request, UUID userId) {
        log.info("Submitting review for product: {} by user: {}", request.getProductId(), userId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (userId != null && reviewRepository.existsByProductProductIdAndUserUserId(request.getProductId(), userId)) {
            throw new RuntimeException("You have already reviewed this product");
        }

        String imagesJson = null;
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            try {
                imagesJson = objectMapper.writeValueAsString(request.getImages());
            } catch (JsonProcessingException e) {
                log.error("Error converting images to JSON", e);
            }
        }

        ProductReview review = ProductReview.builder()
                .product(product)
                .user(null)
                .order(null)
                .rating(request.getRating())
                .title(request.getTitle())
                .reviewText(request.getReviewText())
                .reviewerName(request.getReviewerName() != null ? request.getReviewerName() : "Anonymous")
                .reviewerEmail(request.getReviewerEmail())
                .isVerifiedPurchase(request.getOrderId() != null)
                .images(imagesJson)
                .status(ReviewStatus.PENDING)
                .helpfulCount(0)
                .notHelpfulCount(0)
                .build();

        review = reviewRepository.save(review);
        log.info("Review submitted successfully: {}", review.getReviewId());

        return mapToResponseDto(review);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponseDto> getProductReviews(UUID productId, Pageable pageable) {
        Page<ProductReview> reviews = reviewRepository.findByProductProductIdAndStatus(
                productId, ReviewStatus.APPROVED, pageable);
        return reviews.map(this::mapToResponseDto);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponseDto> getAllProductReviews(UUID productId, Pageable pageable) {
        Page<ProductReview> reviews = reviewRepository.findByProductProductId(productId, pageable);
        return reviews.map(this::mapToResponseDto);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponseDto> getUserReviews(UUID userId, Pageable pageable) {
        Page<ProductReview> reviews = reviewRepository.findByUserUserId(userId, pageable);
        return reviews.map(this::mapToResponseDto);
    }

    @Transactional(readOnly = true)
    public ProductRatingSummaryDto getProductRatingSummary(UUID productId) {
        Double avgRating = reviewRepository.getAverageRating(productId, ReviewStatus.APPROVED);
        Long totalReviews = reviewRepository.countByProductProductIdAndStatus(productId, ReviewStatus.APPROVED);

        List<Object[]> distribution = reviewRepository.getRatingDistribution(productId, ReviewStatus.APPROVED);

        Map<Integer, Long> ratingMap = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            ratingMap.put(i, 0L);
        }

        for (Object[] row : distribution) {
            Integer rating = (Integer) row[0];
            Long count = (Long) row[1];
            ratingMap.put(rating, count);
        }

        ProductRatingSummaryDto.RatingDistribution dist = ProductRatingSummaryDto.RatingDistribution.builder()
                .fiveStars(ratingMap.get(5))
                .fourStars(ratingMap.get(4))
                .threeStars(ratingMap.get(3))
                .twoStars(ratingMap.get(2))
                .oneStar(ratingMap.get(1))
                .build();

        return ProductRatingSummaryDto.builder()
                .productId(productId)
                .averageRating(avgRating != null ? avgRating : 0.0)
                .totalReviews(totalReviews)
                .distribution(dist)
                .build();
    }

    @Transactional
    public ReviewResponseDto markReviewHelpful(ReviewHelpfulDto request) {
        ProductReview review = reviewRepository.findById(request.getReviewId())
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (request.getIsHelpful()) {
            review.incrementHelpful();
        } else {
            review.incrementNotHelpful();
        }

        review = reviewRepository.save(review);
        return mapToResponseDto(review);
    }

    @Transactional
    public ReviewResponseDto moderateReview(ModerateReviewDto request) {
        ProductReview review = reviewRepository.findById(request.getReviewId())
                .orElseThrow(() -> new RuntimeException("Review not found"));

        review.setStatus(request.getStatus());

        if (request.getStatus() == ReviewStatus.REJECTED && request.getReason() != null) {
            review.setAdminResponse(request.getReason());
            review.setAdminResponseAt(LocalDateTime.now());
        }

        review = reviewRepository.save(review);
        log.info("Review {} moderated with status: {}", review.getReviewId(), request.getStatus());

        return mapToResponseDto(review);
    }

    @Transactional
    public ReviewResponseDto respondToReview(AdminReviewResponseDto request) {
        ProductReview review = reviewRepository.findById(request.getReviewId())
                .orElseThrow(() -> new RuntimeException("Review not found"));

        review.setAdminResponse(request.getResponseText());
        review.setAdminResponseAt(LocalDateTime.now());

        review = reviewRepository.save(review);
        log.info("Admin response added to review: {}", review.getReviewId());

        return mapToResponseDto(review);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponseDto> getPendingReviews(Pageable pageable) {
        Page<ProductReview> reviews = reviewRepository.findByStatus(ReviewStatus.PENDING, pageable);
        return reviews.map(this::mapToResponseDto);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponseDto> getLatestReviews(Pageable pageable) {
        Page<ProductReview> reviews = reviewRepository.findByStatusOrderByCreatedAtDesc(
                ReviewStatus.APPROVED, pageable);
        return reviews.map(this::mapToResponseDto);
    }

    @Transactional(readOnly = true)
    public boolean canUserReviewProduct(UUID productId, UUID userId) {
        return !reviewRepository.existsByProductProductIdAndUserUserId(productId, userId);
    }

    private ReviewResponseDto mapToResponseDto(ProductReview review) {
        List<String> imagesList = null;
        if (review.getImages() != null) {
            try {
                imagesList = objectMapper.readValue(review.getImages(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
            } catch (JsonProcessingException e) {
                log.error("Error parsing images JSON", e);
                imagesList = new ArrayList<>();
            }
        }

        return ReviewResponseDto.builder()
                .reviewId(review.getReviewId())
                .productId(review.getProduct().getProductId())
                .productName(review.getProduct().getProductName())
                .rating(review.getRating())
                .title(review.getTitle())
                .reviewText(review.getReviewText())
                .reviewerName(review.getReviewerName())
                .isVerifiedPurchase(review.getIsVerifiedPurchase())
                .images(imagesList)
                .status(review.getStatus())
                .helpfulCount(review.getHelpfulCount())
                .notHelpfulCount(review.getNotHelpfulCount())
                .adminResponse(review.getAdminResponse())
                .adminResponseAt(review.getAdminResponseAt())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .userId(review.getUser() != null ? review.getUser().getUserId() : null)
                .userFullName(null)
                .build();
    }
}