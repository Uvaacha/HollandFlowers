package com.flowerapp.user.controller;

import com.flowerapp.common.response.ApiResponse;
import com.flowerapp.security.CustomUserDetails;
import com.flowerapp.user.dto.UserDto.*;
import com.flowerapp.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "User profile management APIs")
@SecurityRequirement(name = "bearerAuth")
public class UserProfileController {

    private final UserService userService;

    @GetMapping("/profile")
    @Operation(summary = "Get user profile", description = "Get authenticated user's profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        log.info("Profile request for user: {}", currentUser.getUserId());
        UserResponse response = userService.getProfile(currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update user profile", description = "Update authenticated user's profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {
        log.info("Profile update request for user: {}", currentUser.getUserId());
        UserResponse response = userService.updateProfile(currentUser.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PutMapping("/profile/password")
    @Operation(summary = "Change password", description = "Change authenticated user's password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody ChangePasswordRequest request) {
        log.info("Password change request for user: {}", currentUser.getUserId());
        userService.changePassword(currentUser.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }
}
