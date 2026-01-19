package com.flowerapp.review.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewHelpfulDto {

    @NotNull(message = "Review ID is required")
    private Long reviewId;

    @NotNull(message = "Helpful flag is required")
    private Boolean isHelpful;
}