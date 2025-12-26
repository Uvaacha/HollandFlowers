package com.flowerapp.admin.controller;

import com.flowerapp.common.enums.DeliveryStatus;
import com.flowerapp.common.response.ApiResponse;
import com.flowerapp.order.dto.OrderDto.*;
import com.flowerapp.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/admin/orders")
@RequiredArgsConstructor
@Tag(name = "Admin Order Management", description = "Order management for admins")
@SecurityRequirement(name = "bearerAuth")
public class AdminOrderController {

    private final OrderService orderService;

    // ==================== READ Operations (ADMIN & SUPER_ADMIN) ====================

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get all orders")
    public ResponseEntity<ApiResponse<Page<OrderListResponse>>> getAllOrders(
            @PageableDefault(size = 10) Pageable pageable) {

        Page<OrderListResponse> orders = orderService.getAllOrders(pageable);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long orderId) {
        OrderResponse order = orderService.getOrderByIdAdmin(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
    }

    @GetMapping("/delivery-status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get orders by delivery status")
    public ResponseEntity<ApiResponse<Page<OrderListResponse>>> getOrdersByDeliveryStatus(
            @PathVariable DeliveryStatus status,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<OrderListResponse> orders = orderService.getOrdersByDeliveryStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get orders by date range")
    public ResponseEntity<ApiResponse<Page<OrderListResponse>>> getOrdersByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<OrderListResponse> orders = orderService.getOrdersByDateRange(startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get order statistics")
    public ResponseEntity<ApiResponse<OrderStatistics>> getOrderStatistics() {
        OrderStatistics stats = orderService.getOrderStatistics();
        return ResponseEntity.ok(ApiResponse.success("Order statistics retrieved", stats));
    }

    // ==================== WRITE Operations (ADMIN & SUPER_ADMIN can update delivery status) ====================

    @PutMapping("/{orderId}/delivery-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")  // Both ADMIN and SUPER_ADMIN can update
    @Operation(summary = "Update delivery status (ADMIN and SUPER_ADMIN)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateDeliveryStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateDeliveryStatusRequest request) {

        OrderResponse order = orderService.updateDeliveryStatus(orderId, request.getDeliveryStatus());
        return ResponseEntity.ok(ApiResponse.success("Delivery status updated successfully", order));
    }
}
