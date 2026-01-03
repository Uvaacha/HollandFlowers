package com.flowerapp.order.controller;

import com.flowerapp.common.enums.DeliveryStatus;
import com.flowerapp.common.response.ApiResponse;
import com.flowerapp.order.dto.OrderDto.*;
import com.flowerapp.order.service.OrderService;
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
@RequestMapping("/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management for users")
public class OrderController {

    private final OrderService orderService;

    // ============ GUEST CHECKOUT ENDPOINT (NO AUTH REQUIRED) ============
    @PostMapping("/guest")
    @Operation(summary = "Create a guest order (no login required)")
    public ResponseEntity<ApiResponse<OrderResponse>> createGuestOrder(
            @Valid @RequestBody CreateOrderRequest request) {

        // Use existing CreateOrderRequest - pass null for userId to indicate guest
        OrderResponse order = orderService.createGuestOrder(request);
        return ResponseEntity.ok(ApiResponse.success("Order created successfully", order));
    }

    // ============ GUEST ORDER TRACKING (NO AUTH REQUIRED) ============
    @GetMapping("/guest/track")
    @Operation(summary = "Track guest order by order number and email")
    public ResponseEntity<ApiResponse<OrderResponse>> trackGuestOrder(
            @RequestParam String orderNumber,
            @RequestParam String email) {

        OrderResponse order = orderService.getGuestOrderByOrderNumber(orderNumber, email);
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
    }

    // ============ AUTHENTICATED ENDPOINTS ============
    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new order (requires login)")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateOrderRequest request) {

        OrderResponse order = orderService.createOrder(userDetails.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Order created successfully", order));
    }

    @GetMapping
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get user's orders")
    public ResponseEntity<ApiResponse<Page<OrderListResponse>>> getUserOrders(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<OrderListResponse> orders = orderService.getUserOrders(userDetails.getUserId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    @GetMapping("/{orderId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long orderId) {

        OrderResponse order = orderService.getOrderById(orderId, userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
    }

    @GetMapping("/number/{orderNumber}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get order by order number")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByNumber(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String orderNumber) {

        OrderResponse order = orderService.getOrderByOrderNumber(orderNumber, userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Order retrieved successfully", order));
    }

    @GetMapping("/delivery-status/{status}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get user's orders by delivery status")
    public ResponseEntity<ApiResponse<Page<OrderListResponse>>> getUserOrdersByDeliveryStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable DeliveryStatus status,
            @PageableDefault(size = 10) Pageable pageable) {

        Page<OrderListResponse> orders = orderService.getUserOrdersByDeliveryStatus(
                userDetails.getUserId(), status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    @PutMapping("/{orderId}/cancel")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Cancel an order (only pending orders)")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long orderId) {

        OrderResponse order = orderService.cancelOrder(orderId, userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", order));
    }
}