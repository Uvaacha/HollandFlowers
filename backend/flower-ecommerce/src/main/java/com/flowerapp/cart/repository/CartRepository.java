package com.flowerapp.cart.repository;

import com.flowerapp.cart.entity.Cart;
import com.flowerapp.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {

    Optional<Cart> findByUser(User user);

    Optional<Cart> findByUserUserId(UUID userId);

    @Query("SELECT c FROM Cart c LEFT JOIN FETCH c.items i LEFT JOIN FETCH i.product WHERE c.user.userId = :userId")
    Optional<Cart> findByUserIdWithItems(@Param("userId") UUID userId);

    boolean existsByUserUserId(UUID userId);

    void deleteByUserUserId(UUID userId);
}