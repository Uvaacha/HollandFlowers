package com.flowerapp.admin.service;

import com.flowerapp.admin.dto.AdminDto.*;
import com.flowerapp.category.repository.CategoryRepository;
import com.flowerapp.common.enums.DeliveryStatus;
import com.flowerapp.common.enums.RoleType;
import com.flowerapp.common.exception.CustomException;
import com.flowerapp.order.repository.OrderRepository;
import com.flowerapp.product.repository.ProductRepository;
import com.flowerapp.user.entity.User;
import com.flowerapp.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    // ==================== Admin User Management ====================

    /**
     * Create a new admin user (SUPER_ADMIN only)
     */
    public AdminResponse createAdmin(CreateAdminRequest request, UUID creatorId) {
        // Verify creator is SUPER_ADMIN
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> CustomException.notFound("Creator not found"));

        if (creator.getRoleId() != RoleType.SUPER_ADMIN.getRoleNumber()) {
            throw CustomException.forbidden("Only Super Admin can create admin users");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw CustomException.conflict("Email already registered");
        }

        // Check if phone already exists
        if (userRepository.existsByPhone(request.getPhone())) {
            throw CustomException.conflict("Phone number already registered");
        }

        // Create admin user
        User admin = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phoneNumber(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .roleId(request.getRoleId())
                .isActive(true)
                .isEmailVerified(true) // Admin accounts are pre-verified
                .build();

        User savedAdmin = userRepository.save(admin);
        log.info("Admin user created: {} by {}", savedAdmin.getEmail(), creator.getEmail());

        return mapToAdminResponse(savedAdmin);
    }

    /**
     * Update an admin user (SUPER_ADMIN only)
     */
    public AdminResponse updateAdmin(UUID adminId, UpdateAdminRequest request, UUID updaterId) {
        // Verify updater is SUPER_ADMIN
        User updater = userRepository.findById(updaterId)
                .orElseThrow(() -> CustomException.notFound("Updater not found"));

        if (updater.getRoleId() != RoleType.SUPER_ADMIN.getRoleNumber()) {
            throw CustomException.forbidden("Only Super Admin can update admin users");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> CustomException.notFound("Admin user not found"));

        // Cannot update SUPER_ADMIN (except by themselves)
        if (admin.getRoleId() == RoleType.SUPER_ADMIN.getRoleNumber() && !admin.getUserId().equals(updaterId)) {
            throw CustomException.forbidden("Cannot modify another Super Admin account");
        }

        // Update fields
        if (request.getName() != null && !request.getName().isBlank()) {
            admin.setName(request.getName());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            if (!admin.getPhoneNumber().equals(request.getPhone()) && userRepository.existsByPhone(request.getPhone())) {
                throw CustomException.conflict("Phone number already registered");
            }
            admin.setPhoneNumber(request.getPhone());
        }
        if (request.getRoleId() != null) {
            admin.setRoleId(request.getRoleId());
        }

        User savedAdmin = userRepository.save(admin);
        log.info("Admin user updated: {} by {}", savedAdmin.getEmail(), updater.getEmail());

        return mapToAdminResponse(savedAdmin);
    }

    /**
     * Delete/disable an admin user (SUPER_ADMIN only)
     */
    public void deleteAdmin(UUID adminId, UUID deleterId) {
        User deleter = userRepository.findById(deleterId)
                .orElseThrow(() -> CustomException.notFound("Deleter not found"));

        if (deleter.getRoleId() != RoleType.SUPER_ADMIN.getRoleNumber()) {
            throw CustomException.forbidden("Only Super Admin can delete admin users");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> CustomException.notFound("Admin user not found"));

        // Cannot delete SUPER_ADMIN
        if (admin.getRoleId() == RoleType.SUPER_ADMIN.getRoleNumber()) {
            throw CustomException.forbidden("Cannot delete Super Admin account");
        }

        // Cannot delete yourself
        if (admin.getUserId().equals(deleterId)) {
            throw CustomException.forbidden("Cannot delete your own account");
        }

        // Soft delete - just disable the account
        admin.setIsActive(false);
        userRepository.save(admin);

        log.info("Admin user disabled: {} by {}", admin.getEmail(), deleter.getEmail());
    }

    /**
     * Get all admin users
     */
    @Transactional(readOnly = true)
    public Page<AdminResponse> getAllAdmins(Pageable pageable) {
        return userRepository.findByRoleIdIn(
                java.util.List.of(RoleType.ADMIN.getRoleNumber(), RoleType.SUPER_ADMIN.getRoleNumber()),
                pageable
        ).map(this::mapToAdminResponse);
    }

    /**
     * Get admin by ID
     */
    @Transactional(readOnly = true)
    public AdminResponse getAdminById(UUID adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> CustomException.notFound("Admin not found"));

        if (admin.getRoleId() == RoleType.USER.getRoleNumber()) {
            throw CustomException.badRequest("This user is not an admin");
        }

        return mapToAdminResponse(admin);
    }

    // ==================== User Management ====================

    /**
     * Get all users with pagination
     */
    @Transactional(readOnly = true)
    public Page<UserListResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapToUserListResponse);
    }

    /**
     * Get users by role
     */
    @Transactional(readOnly = true)
    public Page<UserListResponse> getUsersByRole(Integer roleId, Pageable pageable) {
        return userRepository.findByRoleId(roleId, pageable).map(this::mapToUserListResponse);
    }

    /**
     * Search users
     */
    @Transactional(readOnly = true)
    public Page<UserListResponse> searchUsers(String keyword, Pageable pageable) {
        return userRepository.searchUsers(keyword, pageable).map(this::mapToUserListResponse);
    }

    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public UserListResponse getUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("User not found"));
        return mapToUserListResponse(user);
    }

    /**
     * Update user status (enable/disable)
     */
    public UserListResponse updateUserStatus(UUID userId, UpdateUserStatusRequest request, UUID adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> CustomException.notFound("Admin not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("User not found"));

        // ADMIN can only update USER accounts
        // SUPER_ADMIN can update USER and ADMIN accounts
        if (admin.getRoleId() == RoleType.ADMIN.getRoleNumber() &&
                user.getRoleId() != RoleType.USER.getRoleNumber()) {
            throw CustomException.forbidden("Admin can only modify user accounts");
        }

        // Cannot disable SUPER_ADMIN
        if (user.getRoleId() == RoleType.SUPER_ADMIN.getRoleNumber()) {
            throw CustomException.forbidden("Cannot modify Super Admin account");
        }

        user.setIsActive(request.getIsActive());
        User savedUser = userRepository.save(user);

        log.info("User status updated: {} to {} by {}", user.getEmail(), request.getIsActive(), admin.getEmail());
        return mapToUserListResponse(savedUser);
    }

    /**
     * Update user role (SUPER_ADMIN only)
     */
    public UserListResponse updateUserRole(UUID userId, UpdateUserRoleRequest request, UUID adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> CustomException.notFound("Admin not found"));

        if (admin.getRoleId() != RoleType.SUPER_ADMIN.getRoleNumber()) {
            throw CustomException.forbidden("Only Super Admin can change user roles");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("User not found"));

        // Cannot demote SUPER_ADMIN
        if (user.getRoleId() == RoleType.SUPER_ADMIN.getRoleNumber() &&
                request.getRoleId() != RoleType.SUPER_ADMIN.getRoleNumber()) {
            throw CustomException.forbidden("Cannot demote Super Admin");
        }

        user.setRoleId(request.getRoleId());
        User savedUser = userRepository.save(user);

        log.info("User role updated: {} to {} by {}", user.getEmail(), request.getRoleId(), admin.getEmail());
        return mapToUserListResponse(savedUser);
    }

    // ==================== Dashboard Statistics ====================

    /**
     * Get dashboard statistics
     */
    @Transactional(readOnly = true)
    public DashboardStatistics getDashboardStatistics() {
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);

        return DashboardStatistics.builder()
                .totalUsers(userRepository.count())
                .totalProducts(productRepository.countByIsActiveTrue())
                .totalCategories(categoryRepository.countByIsActiveTrue())
                .totalOrders(orderRepository.count())
                .pendingOrders(orderRepository.countByDeliveryStatus(DeliveryStatus.PENDING))
                .todayOrders(orderRepository.countByCreatedAtAfter(todayStart))
                .newUsersToday(userRepository.countNewUsersSince(todayStart))
                .lowStockProducts(productRepository.findLowStockProducts(10).size())
                .build();
    }

    // ==================== Customer Management ====================

    /**
     * Get all customers (users with role USER)
     */
    @Transactional(readOnly = true)
    public Page<CustomerResponse> getAllCustomers(Pageable pageable) {
        return userRepository.findByRoleId(RoleType.USER.getRoleNumber(), pageable)
                .map(this::mapToCustomerResponse);
    }

    /**
     * Get customer details with order history
     */
    @Transactional(readOnly = true)
    public CustomerDetailResponse getCustomerDetails(UUID customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> CustomException.notFound("Customer not found"));

        if (customer.getRoleId() != RoleType.USER.getRoleNumber()) {
            throw CustomException.badRequest("This user is not a customer");
        }

        // Get customer orders
        java.util.List<CustomerOrderSummary> recentOrders = orderRepository
                .findByUserUserIdOrderByCreatedAtDesc(customerId)
                .stream()
                .limit(10)
                .map(order -> CustomerOrderSummary.builder()
                        .orderId(order.getOrderId())
                        .orderNumber(order.getOrderNumber())
                        .orderStatus(order.getDeliveryStatus())
                        .totalAmount(order.getTotalAmount())
                        .orderDate(order.getCreatedAt())
                        .build())
                .collect(java.util.stream.Collectors.toList());

        // Calculate total spent
        java.math.BigDecimal totalSpent = orderRepository.calculateTotalSpentByUser(customerId);

        // Get order count
        long totalOrders = orderRepository.countByUserUserId(customerId);

        // Get last order date
        LocalDateTime lastOrderAt = orderRepository.findLastOrderDateByUser(customerId).orElse(null);

        return CustomerDetailResponse.builder()
                .userId(customer.getUserId())
                .name(customer.getName())
                .email(customer.getEmail())
                .phoneNumber(customer.getPhoneNumber())
                .isActive(customer.getIsActive())
                .isEmailVerified(customer.getIsEmailVerified())
                .isPhoneVerified(customer.getIsPhoneVerified())
                .profileImageUrl(customer.getProfileImageUrl())
                .totalOrders((int) totalOrders)
                .totalSpent(totalSpent != null ? totalSpent : java.math.BigDecimal.ZERO)
                .lastOrderAt(lastOrderAt)
                .lastLoginAt(customer.getLastLoginAt())
                .createdAt(customer.getCreatedAt())
                .recentOrders(recentOrders)
                .build();
    }

    /**
     * Search customers
     */
    @Transactional(readOnly = true)
    public Page<CustomerResponse> searchCustomers(String keyword, Pageable pageable) {
        return userRepository.searchUsersByRole(RoleType.USER.getRoleNumber(), keyword, pageable)
                .map(this::mapToCustomerResponse);
    }

    /**
     * Update customer status
     */
    public CustomerResponse updateCustomerStatus(UUID customerId, Boolean isActive) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> CustomException.notFound("Customer not found"));

        if (customer.getRoleId() != RoleType.USER.getRoleNumber()) {
            throw CustomException.badRequest("This user is not a customer");
        }

        customer.setIsActive(isActive);
        User savedCustomer = userRepository.save(customer);

        log.info("Customer status updated: {} to {}", customer.getEmail(), isActive);
        return mapToCustomerResponse(savedCustomer);
    }

    /**
     * Get customer statistics
     */
    @Transactional(readOnly = true)
    public CustomerStats getCustomerStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.withHour(0).withMinute(0).withSecond(0);
        LocalDateTime weekStart = now.minusDays(7);
        LocalDateTime monthStart = now.minusDays(30);

        long totalCustomers = userRepository.countByRoleId(RoleType.USER.getRoleNumber());

        return CustomerStats.builder()
                .totalCustomers(totalCustomers)
                .activeCustomers(userRepository.countActiveCustomers(RoleType.USER.getRoleNumber()))
                .newCustomersToday(userRepository.countNewCustomersSince(RoleType.USER.getRoleNumber(), todayStart))
                .newCustomersThisWeek(userRepository.countNewCustomersSince(RoleType.USER.getRoleNumber(), weekStart))
                .newCustomersThisMonth(userRepository.countNewCustomersSince(RoleType.USER.getRoleNumber(), monthStart))
                .customersWithOrders(orderRepository.countDistinctCustomersWithOrders())
                .build();
    }

    // ==================== Helper Methods ====================

    private CustomerResponse mapToCustomerResponse(User user) {
        long totalOrders = orderRepository.countByUserUserId(user.getUserId());
        java.math.BigDecimal totalSpent = orderRepository.calculateTotalSpentByUser(user.getUserId());
        LocalDateTime lastOrderAt = orderRepository.findLastOrderDateByUser(user.getUserId()).orElse(null);

        return CustomerResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .isActive(user.getIsActive())
                .isEmailVerified(user.getIsEmailVerified())
                .isPhoneVerified(user.getIsPhoneVerified())
                .profileImageUrl(user.getProfileImageUrl())
                .totalOrders((int) totalOrders)
                .totalSpent(totalSpent != null ? totalSpent : java.math.BigDecimal.ZERO)
                .lastOrderAt(lastOrderAt)
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private AdminResponse mapToAdminResponse(User user) {
        return AdminResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhoneNumber())
                .roleId(user.getRoleId())
                .roleName(RoleType.fromRoleNumber(user.getRoleId()).name())
                .isActive(user.getIsActive())
                .isEmailVerified(user.getIsEmailVerified())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private UserListResponse mapToUserListResponse(User user) {
        return UserListResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhoneNumber())
                .roleId(user.getRoleId())
                .roleName(RoleType.fromRoleNumber(user.getRoleId()).name())
                .isActive(user.getIsActive())
                .isEmailVerified(user.getIsEmailVerified())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}