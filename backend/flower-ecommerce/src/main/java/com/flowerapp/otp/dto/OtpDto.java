package com.flowerapp.otp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

public class OtpDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendOtpRequest {
        @NotBlank(message = "Email or phone number is required")
        private String emailOrPhone;

        private String purpose; // LOGIN, SIGNUP, RESET_PASSWORD, VERIFY_EMAIL
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VerifyOtpRequest {
        @NotBlank(message = "Email or phone number is required")
        private String emailOrPhone;

        @NotBlank(message = "OTP is required")
        @Size(min = 4, max = 6, message = "OTP must be 4-6 digits")
        private String otp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OtpResponse {
        private boolean sent;
        private String message;
        private Integer expiryMinutes;
    }
}
