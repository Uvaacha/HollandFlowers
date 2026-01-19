package com.flowerapp.review.controller;

import com.flowerapp.review.dto.*;
import com.flowerapp.review.service.ProductReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Product Reviews", description = "Product review management APIs")
@CrossOrigin(origins = "*")
public class ProductReviewController {

    private final ProductReviewService reviewService;

    @PostMapping
    @Operation(summary = "Submit a product review")
    public ResponseEntity<Map<String, Object>> submitReview(
            @Valid @RequestBody ReviewRequestDto request,
            Authentication authentication) {

        try {
            UUID userId = authentication != null ? getUserIdFromAuth(authentication) : null;

            ReviewResponseDto review = reviewService.submitReview(request, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review submitted successfully and is pending approval");
            response.put("data", review);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error submitting review", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get product reviews")
    public ResponseEntity<Map<String, Object>> getProductReviews(
            @PathVariable UUID productId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        try {
            Page<ReviewResponseDto> reviews = reviewService.getProductReviews(productId, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", reviews);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching reviews", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/product/{productId}/summary")
    @Operation(summary = "Get product rating summary")
    public ResponseEntity<Map<String, Object>> getProductRatingSummary(@PathVariable UUID productId) {
        try {
            ProductRatingSummaryDto summary = reviewService.getProductRatingSummary(productId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", summary);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching rating summary", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/user/my-reviews")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user's reviews")
    public ResponseEntity<Map<String, Object>> getUserReviews(
            Authentication authentication,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        try {
            UUID userId = getUserIdFromAuth(authentication);
            Page<ReviewResponseDto> reviews = reviewService.getUserReviews(userId, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", reviews);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching user reviews", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/helpful")
    @Operation(summary = "Mark review as helpful or not helpful")
    public ResponseEntity<Map<String, Object>> markReviewHelpful(@Valid @RequestBody ReviewHelpfulDto request) {
        try {
            ReviewResponseDto review = reviewService.markReviewHelpful(request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", review);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error marking review helpful", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/can-review/{productId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Check if user can review this product")
    public ResponseEntity<Map<String, Object>> canReviewProduct(
            @PathVariable UUID productId,
            Authentication authentication) {

        try {
            UUID userId = getUserIdFromAuth(authentication);
            boolean canReview = reviewService.canUserReviewProduct(productId, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("canReview", canReview);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error checking review permission", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get pending reviews (Admin only)")
    public ResponseEntity<Map<String, Object>> getPendingReviews(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable) {

        try {
            Page<ReviewResponseDto> reviews = reviewService.getPendingReviews(pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", reviews);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching pending reviews", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/admin/moderate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Moderate review (Admin only)")
    public ResponseEntity<Map<String, Object>> moderateReview(@Valid @RequestBody ModerateReviewDto request) {
        try {
            ReviewResponseDto review = reviewService.moderateReview(request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review moderated successfully");
            response.put("data", review);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error moderating review", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/admin/respond")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Respond to review (Admin only)")
    public ResponseEntity<Map<String, Object>> respondToReview(@Valid @RequestBody AdminReviewResponseDto request) {
        try {
            ReviewResponseDto review = reviewService.respondToReview(request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Response added successfully");
            response.put("data", review);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error responding to review", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/admin/product/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all product reviews including pending (Admin only)")
    public ResponseEntity<Map<String, Object>> getAllProductReviews(
            @PathVariable UUID productId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        try {
            Page<ReviewResponseDto> reviews = reviewService.getAllProductReviews(productId, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", reviews);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching all reviews", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private UUID getUserIdFromAuth(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return null;
        }

        try {
            Object principal = authentication.getPrincipal();

            if (principal instanceof com.flowerapp.user.entity.User) {
                return ((com.flowerapp.user.entity.User) principal).getUserId();
            }

            if (principal instanceof UUID) {
                return (UUID) principal;
            }

            if (principal instanceof String) {
                return UUID.fromString((String) principal);
            }

            log.warn("Unable to extract userId from authentication principal: {}", principal.getClass().getName());
            return null;

        } catch (Exception e) {
            log.error("Error extracting userId from authentication", e);
            return null;
        }
    }
}