package com.flowerapp.review.dto;

import jakarta.validation.constraints.NotBlank;
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
public class AdminReviewResponseDto {

    @NotNull(message = "Review ID is required")
    private Long reviewId;

    @NotBlank(message = "Response text is required")
    @Size(max = 2000, message = "Response must not exceed 2000 characters")
    private String responseText;
}