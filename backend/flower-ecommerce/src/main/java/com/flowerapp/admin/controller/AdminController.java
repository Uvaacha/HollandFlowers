package com.flowerapp.admin.controller;

import com.flowerapp.admin.dto.AdminDto.*;
import com.flowerapp.admin.service.AdminService;
import com.flowerapp.common.response.ApiResponse;
import com.flowerapp.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Management", description = "Admin and user management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;

    // ==================== Admin User Management (SUPER_ADMIN only) ====================

    @PostMapping("/admins")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Create a new admin user (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<AdminResponse>> createAdmin(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateAdminRequest request) {

        AdminResponse admin = adminService.createAdmin(request, userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Admin created successfully", admin));
    }

    @PutMapping("/admins/{adminId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update an admin user (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<AdminResponse>> updateAdmin(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID adminId,
            @Valid @RequestBody UpdateAdminRequest request) {

        AdminResponse admin = adminService.updateAdmin(adminId, request, userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Admin updated successfully", admin));
    }

    @DeleteMapping("/admins/{adminId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete/disable an admin user (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<Void>> deleteAdmin(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID adminId) {

        adminService.deleteAdmin(adminId, userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Admin disabled successfully", null));
    }

    @GetMapping("/admins")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get all admin users (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<Page<AdminResponse>>> getAllAdmins(
            @PageableDefault(size = 10) Pageable pageable) {

        Page<AdminResponse> admins = adminService.getAllAdmins(pageable);
        return ResponseEntity.ok(ApiResponse.success("Admins retrieved successfully", admins));
    }

    @GetMapping("/admins/{adminId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Get admin by ID (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<AdminResponse>> getAdminById(@PathVariable UUID adminId) {
        AdminResponse admin = adminService.getAdminById(adminId);
        return ResponseEntity.ok(ApiResponse.success("Admin retrieved successfully", admin));
    }

    // ==================== User Management (ADMIN and SUPER_ADMIN) ====================

    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<Page<UserListResponse>>> getAllUsers(
            @PageableDefault(size = 10) Pageable pageable) {

        Page<UserListResponse> users = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @GetMapping("/users/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserListResponse>> getUserById(@PathVariable UUID userId) {
        UserListResponse user = adminService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    @GetMapping("/users/role/{roleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get users by role")
    public ResponseEntity<ApiResponse<Page<UserListResponse>>> getUsersByRole(
            @PathVariable Integer roleId,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<UserListResponse> users = adminService.getUsersByRole(roleId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @GetMapping("/users/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Search users by keyword")
    public ResponseEntity<ApiResponse<Page<UserListResponse>>> searchUsers(
            @RequestParam String keyword,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<UserListResponse> users = adminService.searchUsers(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @PutMapping("/users/{userId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Enable or disable a user")
    public ResponseEntity<ApiResponse<UserListResponse>> updateUserStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserStatusRequest request) {

        UserListResponse user = adminService.updateUserStatus(userId, request, userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", user));
    }

    @PutMapping("/users/{userId}/role")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Change user role (SUPER_ADMIN only)")
    public ResponseEntity<ApiResponse<UserListResponse>> updateUserRole(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserRoleRequest request) {

        UserListResponse user = adminService.updateUserRole(userId, request, userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", user));
    }

    // ==================== Dashboard ====================

    @GetMapping("/dashboard/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStatistics>> getDashboardStatistics() {
        DashboardStatistics stats = adminService.getDashboardStatistics();
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved", stats));
    }
}
