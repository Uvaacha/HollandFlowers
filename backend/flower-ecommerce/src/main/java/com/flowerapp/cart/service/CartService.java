package com.flowerapp.cart.service;

import com.flowerapp.cart.dto.CartDto;
import com.flowerapp.cart.entity.Cart;
import com.flowerapp.cart.entity.CartItem;
import com.flowerapp.cart.repository.CartItemRepository;
import com.flowerapp.cart.repository.CartRepository;
import com.flowerapp.common.exception.CustomException;
import com.flowerapp.product.entity.Product;
import com.flowerapp.product.repository.ProductRepository;
import com.flowerapp.user.entity.User;
import com.flowerapp.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * Get user's cart with all items
     */
    @Transactional(readOnly = true)
    public CartDto.CartResponse getCart(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        return mapCartToResponse(cart);
    }

    /**
     * Add item to cart
     */
    @Transactional
    public CartDto.CartResponse addToCart(UUID userId, CartDto.AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new CustomException("Product not found", HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND"));

        // Check if item already exists with same variant
        Optional<CartItem> existingItem = cartItemRepository
                .findByCartAndProductAndSelectedVariant(cart, product, request.getSelectedVariant());

        if (existingItem.isPresent()) {
            // Update quantity
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + (request.getQuantity() != null ? request.getQuantity() : 1));
            cartItemRepository.save(item);
            log.info("Updated cart item quantity for user {}: product {}", userId, product.getProductId());
        } else {
            // Create new cart item
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity() != null ? request.getQuantity() : 1)
                    .selectedVariant(request.getSelectedVariant())
                    .priceAtAddition(product.getFinalPrice())
                    .deliveryDate(request.getDeliveryDate())
                    .deliveryTime(request.getDeliveryTime())
                    .cardMessage(request.getCardMessage())
                    .senderInfo(request.getSenderInfo())
                    .build();

            cart.addItem(newItem);
            cartItemRepository.save(newItem);
            log.info("Added new item to cart for user {}: product {}", userId, product.getProductId());
        }

        return mapCartToResponse(cart);
    }

    /**
     * Update cart item quantity
     */
    @Transactional
    public CartDto.CartResponse updateCartItem(UUID userId, CartDto.UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(request.getCartItemId())
                .orElseThrow(() -> new CustomException("Cart item not found", HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND"));

        // Verify item belongs to user's cart
        if (!item.getCart().getCartId().equals(cart.getCartId())) {
            throw new CustomException("Cart item does not belong to user", HttpStatus.FORBIDDEN, "FORBIDDEN");
        }

        if (request.getQuantity() <= 0) {
            // Remove item if quantity is 0 or negative
            cart.removeItem(item);
            cartItemRepository.delete(item);
            log.info("Removed item from cart for user {}: item {}", userId, request.getCartItemId());
        } else {
            item.setQuantity(request.getQuantity());
            cartItemRepository.save(item);
            log.info("Updated cart item for user {}: item {} quantity {}", userId, request.getCartItemId(), request.getQuantity());
        }

        return mapCartToResponse(cart);
    }

    /**
     * Remove item from cart
     */
    @Transactional
    public CartDto.CartResponse removeFromCart(UUID userId, UUID cartItemId) {
        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new CustomException("Cart item not found", HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND"));

        // Verify item belongs to user's cart
        if (!item.getCart().getCartId().equals(cart.getCartId())) {
            throw new CustomException("Cart item does not belong to user", HttpStatus.FORBIDDEN, "FORBIDDEN");
        }

        cart.removeItem(item);
        cartItemRepository.delete(item);
        log.info("Removed item from cart for user {}: item {}", userId, cartItemId);

        return mapCartToResponse(cart);
    }

    /**
     * Remove item by product ID and variant
     */
    @Transactional
    public CartDto.CartResponse removeByProductAndVariant(UUID userId, UUID productId, String selectedVariant) {
        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new CustomException("Product not found", HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND"));

        Optional<CartItem> item = cartItemRepository
                .findByCartAndProductAndSelectedVariant(cart, product, selectedVariant);

        if (item.isPresent()) {
            cart.removeItem(item.get());
            cartItemRepository.delete(item.get());
            log.info("Removed item from cart for user {}: product {} variant {}", userId, productId, selectedVariant);
        }

        return mapCartToResponse(cart);
    }

    /**
     * Clear entire cart
     */
    @Transactional
    public void clearCart(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        cart.clearItems();
        cartItemRepository.deleteAllByCartId(cart.getCartId());
        log.info("Cleared cart for user {}", userId);
    }

    /**
     * Sync cart from frontend (merge guest cart with user cart on login)
     */
    @Transactional
    public CartDto.CartResponse syncCart(UUID userId, CartDto.SyncCartRequest request) {
        Cart cart = getOrCreateCart(userId);

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (CartDto.SyncCartItem syncItem : request.getItems()) {
                UUID productId = syncItem.getProductId();

                // Try to parse from string ID if UUID is null
                if (productId == null && syncItem.getId() != null) {
                    try {
                        productId = UUID.fromString(syncItem.getId());
                    } catch (IllegalArgumentException e) {
                        log.warn("Invalid product ID format: {}", syncItem.getId());
                        continue;
                    }
                }

                if (productId == null) {
                    continue;
                }

                Optional<Product> productOpt = productRepository.findById(productId);
                if (productOpt.isEmpty()) {
                    log.warn("Product not found during sync: {}", productId);
                    continue;
                }

                Product product = productOpt.get();

                // Check if item already exists
                Optional<CartItem> existingItem = cartItemRepository
                        .findByCartAndProductAndSelectedVariant(cart, product, syncItem.getSelectedVariant());

                if (existingItem.isPresent()) {
                    // Update quantity (take the higher value)
                    CartItem item = existingItem.get();
                    int newQuantity = Math.max(item.getQuantity(), syncItem.getQuantity() != null ? syncItem.getQuantity() : 1);
                    item.setQuantity(newQuantity);
                    cartItemRepository.save(item);
                } else {
                    // Add new item
                    CartItem newItem = CartItem.builder()
                            .cart(cart)
                            .product(product)
                            .quantity(syncItem.getQuantity() != null ? syncItem.getQuantity() : 1)
                            .selectedVariant(syncItem.getSelectedVariant())
                            .priceAtAddition(product.getFinalPrice())
                            .deliveryDate(syncItem.getDeliveryDate())
                            .deliveryTime(syncItem.getDeliveryTime())
                            .cardMessage(syncItem.getCardMessage())
                            .senderInfo(syncItem.getSenderInfo())
                            .build();

                    cart.addItem(newItem);
                    cartItemRepository.save(newItem);
                }
            }
            log.info("Synced {} items to cart for user {}", request.getItems().size(), userId);
        }

        return mapCartToResponse(cart);
    }

    /**
     * Get item count in cart
     */
    @Transactional(readOnly = true)
    public int getCartItemCount(UUID userId) {
        Optional<Cart> cartOpt = cartRepository.findByUserUserId(userId);
        if (cartOpt.isEmpty()) {
            return 0;
        }

        return cartOpt.get().getItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
    }

    // ==================== Helper Methods ====================

    private Cart getOrCreateCart(UUID userId) {
        return cartRepository.findByUserIdWithItems(userId)
                .orElseGet(() -> createCart(userId));
    }

    private Cart createCart(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        Cart cart = Cart.builder()
                .user(user)
                .build();

        return cartRepository.save(cart);
    }

    private CartDto.CartResponse mapCartToResponse(Cart cart) {
        List<CartDto.CartItemResponse> itemResponses = cart.getItems().stream()
                .map(this::mapCartItemToResponse)
                .collect(Collectors.toList());

        BigDecimal subtotal = itemResponses.stream()
                .map(CartDto.CartItemResponse::getItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal originalTotal = cart.getItems().stream()
                .map(item -> {
                    BigDecimal originalPrice = item.getProduct().getActualPrice();
                    return originalPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal savings = originalTotal.subtract(subtotal).max(BigDecimal.ZERO);

        int itemCount = cart.getItems().stream()
                .mapToInt(CartItem::getQuantity)
                .sum();

        return CartDto.CartResponse.builder()
                .cartId(cart.getCartId())
                .items(itemResponses)
                .itemCount(itemCount)
                .subtotal(subtotal.setScale(3, RoundingMode.HALF_UP))
                .originalTotal(originalTotal.setScale(3, RoundingMode.HALF_UP))
                .savings(savings.setScale(3, RoundingMode.HALF_UP))
                .build();
    }

    private CartDto.CartItemResponse mapCartItemToResponse(CartItem item) {
        Product product = item.getProduct();

        BigDecimal itemTotal = item.getPriceAtAddition() != null
                ? item.getPriceAtAddition().multiply(BigDecimal.valueOf(item.getQuantity()))
                : BigDecimal.ZERO;

        return CartDto.CartItemResponse.builder()
                .cartItemId(item.getCartItemId())
                .productId(product.getProductId())
                .productName(product.getProductName())
                .productNameAr(null) // Add if you have Arabic name field
                .imageUrl(product.getImageUrl())
                .price(item.getPriceAtAddition())
                .originalPrice(product.getActualPrice())
                .finalPrice(product.getFinalPrice())
                .quantity(item.getQuantity())
                .selectedVariant(item.getSelectedVariant())
                .deliveryDate(item.getDeliveryDate())
                .deliveryTime(item.getDeliveryTime())
                .cardMessage(item.getCardMessage())
                .senderInfo(item.getSenderInfo())
                .itemTotal(itemTotal.setScale(3, RoundingMode.HALF_UP))
                .build();
    }
}