package com.flowerapp.review.dto;

import com.flowerapp.review.entity.ProductReview.ReviewStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModerateReviewDto {

    @NotNull(message = "Review ID is required")
    private Long reviewId;

    @NotNull(message = "Status is required")
    private ReviewStatus status;

    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}