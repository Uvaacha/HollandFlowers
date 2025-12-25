package com.flowerapp.cart.controller;

import com.flowerapp.cart.dto.CartDto;
import com.flowerapp.cart.service.CartService;
import com.flowerapp.common.response.ApiResponse;
import com.flowerapp.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Slf4j
//@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CartController {

    private final CartService cartService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Get user's cart
     */
    @GetMapping
    public ResponseEntity<ApiResponse<CartDto.CartResponse>> getCart(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        CartDto.CartResponse cart = cartService.getCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", cart));
    }

    /**
     * Add item to cart
     */
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartDto.CartResponse>> addToCart(
            HttpServletRequest request,
            @RequestBody CartDto.AddToCartRequest addRequest) {
        UUID userId = extractUserId(request);
        CartDto.CartResponse cart = cartService.addToCart(userId, addRequest);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
    }

    /**
     * Update cart item quantity
     */
    @PutMapping("/update")
    public ResponseEntity<ApiResponse<CartDto.CartResponse>> updateCartItem(
            HttpServletRequest request,
            @RequestBody CartDto.UpdateCartItemRequest updateRequest) {
        UUID userId = extractUserId(request);
        CartDto.CartResponse cart = cartService.updateCartItem(userId, updateRequest);
        return ResponseEntity.ok(ApiResponse.success("Cart updated", cart));
    }

    /**
     * Remove item from cart by cart item ID
     */
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<ApiResponse<CartDto.CartResponse>> removeFromCart(
            HttpServletRequest request,
            @PathVariable UUID cartItemId) {
        UUID userId = extractUserId(request);
        CartDto.CartResponse cart = cartService.removeFromCart(userId, cartItemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    /**
     * Remove item by product ID and variant
     */
    @DeleteMapping("/remove-product/{productId}")
    public ResponseEntity<ApiResponse<CartDto.CartResponse>> removeByProduct(
            HttpServletRequest request,
            @PathVariable UUID productId,
            @RequestParam(required = false) String variant) {
        UUID userId = extractUserId(request);
        CartDto.CartResponse cart = cartService.removeByProductAndVariant(userId, productId, variant);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    /**
     * Clear entire cart
     */
    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<String>> clearCart(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", "Cart cleared successfully"));
    }

    /**
     * Sync cart from frontend (merge guest cart with user cart on login)
     */
    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<CartDto.CartResponse>> syncCart(
            HttpServletRequest request,
            @RequestBody CartDto.SyncCartRequest syncRequest) {
        UUID userId = extractUserId(request);
        CartDto.CartResponse cart = cartService.syncCart(userId, syncRequest);
        return ResponseEntity.ok(ApiResponse.success("Cart synced successfully", cart));
    }

    /**
     * Get cart item count
     */
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Integer>> getCartCount(HttpServletRequest request) {
        UUID userId = extractUserId(request);
        int count = cartService.getCartItemCount(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart count retrieved", count));
    }

    // ==================== Helper Methods ====================

    private UUID extractUserId(HttpServletRequest request) {
        String token = extractToken(request);
        if (token == null) {
            throw new RuntimeException("No authentication token provided");
        }
        return jwtTokenProvider.extractUserId(token);
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}