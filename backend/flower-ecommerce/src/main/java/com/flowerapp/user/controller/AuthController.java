package com.flowerapp.user.controller;

import com.flowerapp.common.response.ApiResponse;
import com.flowerapp.user.dto.UserDto.*;
import com.flowerapp.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication and registration APIs")
public class AuthController {

    private final UserService userService;

    @PostMapping("/signup")
    @Operation(summary = "Register a new user", description = "Create a new user account with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(
            @Valid @RequestBody SignupRequest request) {
        log.info("Signup request received for email: {}", request.getEmail());
        AuthResponse response = userService.signup(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        log.info("Login request received for email: {}", request.getEmail());
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/otp/request")
    @Operation(summary = "Request OTP for login", description = "Send OTP to email or phone for passwordless login")
    public ResponseEntity<ApiResponse<Void>> requestOtpLogin(
            @Valid @RequestBody OtpLoginRequest request) {
        log.info("OTP login request for: {}", request.getEmailOrPhone());
        userService.requestOtpLogin(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully"));
    }

    @PostMapping("/otp/verify")
    @Operation(summary = "Verify OTP and login", description = "Verify OTP and authenticate user")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtpLogin(
            @Valid @RequestBody OtpVerifyRequest request) {
        log.info("OTP verification request for: {}", request.getEmailOrPhone());
        AuthResponse response = userService.verifyOtpLogin(request);
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully", response));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access token", description = "Get new access token using refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        log.info("Token refresh request received");
        AuthResponse response = userService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset", description = "Send OTP for password reset")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Password reset request for: {}", request.getEmail());
        userService.requestPasswordReset(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset OTP sent to your email"));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Reset password using OTP")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        log.info("Password reset verification for: {}", request.getEmail());
        userService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successful"));
    }

    @PostMapping("/google")
    @Operation(summary = "Google OAuth login", description = "Authenticate or register user with Google account")
    public ResponseEntity<ApiResponse<AuthResponse>> googleAuth(
            @Valid @RequestBody GoogleAuthRequest request) {
        log.info("Google authentication request for email: {}", request.getEmail());
        AuthResponse response = userService.authenticateWithGoogle(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}