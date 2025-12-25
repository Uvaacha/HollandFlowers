package com.flowerapp.user.repository;

import com.flowerapp.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhoneNumber(String phoneNumber);

    Optional<User> findByEmailOrPhoneNumber(String email, String phoneNumber);

    @Query("SELECT u FROM User u WHERE u.phoneNumber LIKE CONCAT('%', :phoneEnding)")
    Optional<User> findByPhoneNumberEndingWith(@Param("phoneEnding") String phoneEnding);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    // Alias for phone
    default boolean existsByPhone(String phone) {
        return existsByPhoneNumber(phone);
    }

    List<User> findByRoleId(Integer roleId);

    Page<User> findByRoleId(Integer roleId, Pageable pageable);

    Page<User> findByRoleIdIn(List<Integer> roleIds, Pageable pageable);

    Page<User> findByIsActive(Boolean isActive, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.roleId = :roleId AND u.isActive = :isActive")
    Page<User> findByRoleIdAndIsActive(@Param("roleId") Integer roleId,
                                       @Param("isActive") Boolean isActive,
                                       Pageable pageable);

    @Query("SELECT u FROM User u WHERE " +
            "(LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "u.phoneNumber LIKE CONCAT('%', :search, '%'))")
    Page<User> searchUsers(@Param("search") String search, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.roleId = :roleId AND " +
            "(LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchUsersByRole(@Param("roleId") Integer roleId,
                                 @Param("search") String search,
                                 Pageable pageable);

    @Modifying
    @Query("UPDATE User u SET u.lastLoginAt = :loginTime WHERE u.userId = :userId")
    void updateLastLoginTime(@Param("userId") UUID userId, @Param("loginTime") LocalDateTime loginTime);

    @Modifying
    @Query("UPDATE User u SET u.isActive = :isActive WHERE u.userId = :userId")
    void updateActiveStatus(@Param("userId") UUID userId, @Param("isActive") Boolean isActive);

    @Modifying
    @Query("UPDATE User u SET u.isEmailVerified = true WHERE u.userId = :userId")
    void verifyEmail(@Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE User u SET u.isPhoneVerified = true WHERE u.userId = :userId")
    void verifyPhone(@Param("userId") UUID userId);

    @Query("SELECT COUNT(u) FROM User u WHERE u.roleId = :roleId")
    long countByRoleId(@Param("roleId") Integer roleId);

    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true")
    long countActiveUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :since")
    long countNewUsersSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(u) FROM User u WHERE u.roleId = :roleId AND u.isActive = true")
    long countActiveCustomers(@Param("roleId") Integer roleId);

    @Query("SELECT COUNT(u) FROM User u WHERE u.roleId = :roleId AND u.createdAt >= :since")
    long countNewCustomersSince(@Param("roleId") Integer roleId, @Param("since") LocalDateTime since);
}