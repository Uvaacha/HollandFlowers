package com.flowerapp.category.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

public class CategoryDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateCategoryRequest {
        @NotBlank(message = "Category name is required")
        @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
        private String categoryName;

        @Size(max = 500, message = "Description cannot exceed 500 characters")
        private String description;

        private String imageUrl;

        private Integer displayOrder;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateCategoryRequest {
        @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
        private String categoryName;

        @Size(max = 500, message = "Description cannot exceed 500 characters")
        private String description;

        private String imageUrl;

        private Integer displayOrder;

        private Boolean isActive;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CategoryResponse {
        private UUID categoryId;
        private String categoryName;
        private String description;
        private String imageUrl;
        private Integer displayOrder;
        private Boolean isActive;
        private Long productCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
