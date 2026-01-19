package com.flowerapp.review.dto;

import com.flowerapp.review.entity.ProductReview.ReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDto {

    private Long reviewId;
    private UUID productId;
    private String productName;
    private Integer rating;
    private String title;
    private String reviewText;
    private String reviewerName;
    private Boolean isVerifiedPurchase;
    private List<String> images;
    private ReviewStatus status;
    private Integer helpfulCount;
    private Integer notHelpfulCount;
    private String adminResponse;
    private LocalDateTime adminResponseAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID userId;
    private String userFullName;
}
