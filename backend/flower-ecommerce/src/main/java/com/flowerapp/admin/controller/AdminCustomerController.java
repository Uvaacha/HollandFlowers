package com.flowerapp.admin.controller;

import com.flowerapp.admin.dto.AdminDto.*;
import com.flowerapp.admin.service.AdminService;
import com.flowerapp.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/customers")
@RequiredArgsConstructor
@Tag(name = "Admin Customer Management", description = "Customer management for admins")
@SecurityRequirement(name = "bearerAuth")
public class AdminCustomerController {

    private final AdminService adminService;

    // Debug endpoint - check user authorities (no role restriction)
    @GetMapping("/debug-auth")
    @Operation(summary = "Debug authentication", description = "Check current user authorities")
    public ResponseEntity<ApiResponse<String>> debugAuth(
            org.springframework.security.core.Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok(ApiResponse.success("No authentication found", "NOT_AUTHENTICATED"));
        }
        String info = String.format("User: %s | Authorities: %s | Principal: %s",
                authentication.getName(),
                authentication.getAuthorities(),
                authentication.getPrincipal().getClass().getSimpleName());
        return ResponseEntity.ok(ApiResponse.success("Auth debug info", info));
    }

    // ==================== READ Operations (ADMIN & SUPER_ADMIN) ====================

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get all customers", description = "Retrieve all customers with pagination")
    public ResponseEntity<ApiResponse<Page<CustomerResponse>>> getAllCustomers(
            @PageableDefault(size = 10) Pageable pageable) {

        Page<CustomerResponse> customers = adminService.getAllCustomers(pageable);
        return ResponseEntity.ok(ApiResponse.success("Customers retrieved successfully", customers));
    }

    @GetMapping("/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get customer details", description = "Get detailed information about a customer")
    public ResponseEntity<ApiResponse<CustomerDetailResponse>> getCustomerDetails(
            @PathVariable UUID customerId) {

        CustomerDetailResponse customer = adminService.getCustomerDetails(customerId);
        return ResponseEntity.ok(ApiResponse.success("Customer details retrieved", customer));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Search customers", description = "Search customers by name, email, or phone")
    public ResponseEntity<ApiResponse<Page<CustomerResponse>>> searchCustomers(
            @RequestParam String keyword,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<CustomerResponse> customers = adminService.searchCustomers(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success("Search results", customers));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get customer statistics", description = "Get overall customer statistics")
    public ResponseEntity<ApiResponse<CustomerStats>> getCustomerStats() {
        CustomerStats stats = adminService.getCustomerStats();
        return ResponseEntity.ok(ApiResponse.success("Customer statistics", stats));
    }

    // ==================== WRITE Operations (SUPER_ADMIN only) ====================

    @PutMapping("/{customerId}/status")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Update customer status (SUPER_ADMIN only)", description = "Activate or deactivate a customer account")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomerStatus(
            @PathVariable UUID customerId,
            @RequestBody UpdateUserStatusRequest request) {

        CustomerResponse customer = adminService.updateCustomerStatus(customerId, request.getIsActive());
        return ResponseEntity.ok(ApiResponse.success("Customer status updated", customer));
    }
}