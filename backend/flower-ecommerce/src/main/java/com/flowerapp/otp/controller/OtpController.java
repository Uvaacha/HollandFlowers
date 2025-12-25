package com.flowerapp.otp.controller;

import com.flowerapp.common.response.ApiResponse;
import com.flowerapp.otp.dto.OtpDto.*;
import com.flowerapp.otp.service.OtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/public/otp")
@RequiredArgsConstructor
@Tag(name = "OTP", description = "OTP generation and verification APIs")
public class OtpController {

    private final OtpService otpService;

    @Value("${otp.expiry-minutes:5}")
    private int otpExpiryMinutes;

    @PostMapping("/send")
    @Operation(summary = "Send OTP", description = "Generate and send OTP to email or phone")
    public ResponseEntity<ApiResponse<OtpResponse>> sendOtp(
            @Valid @RequestBody SendOtpRequest request) {
        log.info("OTP send request for: {}", request.getEmailOrPhone());
        
        String purpose = request.getPurpose() != null ? request.getPurpose() : "LOGIN";
        otpService.generateAndSendOtp(request.getEmailOrPhone(), purpose);
        
        OtpResponse response = OtpResponse.builder()
                .sent(true)
                .message("OTP sent successfully")
                .expiryMinutes(otpExpiryMinutes)
                .build();
                
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully", response));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify OTP", description = "Verify the OTP code")
    public ResponseEntity<ApiResponse<Boolean>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        log.info("OTP verification request for: {}", request.getEmailOrPhone());
        
        boolean isValid = otpService.verifyOtp(request.getEmailOrPhone(), request.getOtp());
        
        if (isValid) {
            return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", true));
        } else {
            return ResponseEntity.ok(ApiResponse.error("Invalid OTP", "INVALID_OTP"));
        }
    }

    @PostMapping("/resend")
    @Operation(summary = "Resend OTP", description = "Resend the OTP code")
    public ResponseEntity<ApiResponse<OtpResponse>> resendOtp(
            @Valid @RequestBody SendOtpRequest request) {
        log.info("OTP resend request for: {}", request.getEmailOrPhone());
        
        otpService.resendOtp(request.getEmailOrPhone());
        
        OtpResponse response = OtpResponse.builder()
                .sent(true)
                .message("OTP resent successfully")
                .expiryMinutes(otpExpiryMinutes)
                .build();
                
        return ResponseEntity.ok(ApiResponse.success("OTP resent successfully", response));
    }
}
