package com.flowerapp.cart.repository;

import com.flowerapp.cart.entity.Cart;
import com.flowerapp.cart.entity.CartItem;
import com.flowerapp.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    List<CartItem> findByCart(Cart cart);

    List<CartItem> findByCartCartId(UUID cartId);

    Optional<CartItem> findByCartAndProductAndSelectedVariant(Cart cart, Product product, String selectedVariant);

    Optional<CartItem> findByCartCartIdAndProductProductIdAndSelectedVariant(
            UUID cartId, UUID productId, String selectedVariant);

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.cartId = :cartId")
    void deleteAllByCartId(@Param("cartId") UUID cartId);

    @Query("SELECT ci FROM CartItem ci JOIN FETCH ci.product WHERE ci.cart.cartId = :cartId")
    List<CartItem> findByCartIdWithProducts(@Param("cartId") UUID cartId);

    int countByCartCartId(UUID cartId);
}