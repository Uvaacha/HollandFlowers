package com.flowerapp.order.service;

import com.flowerapp.common.enums.DeliveryStatus;
import com.flowerapp.common.exception.CustomException;
import com.flowerapp.hebasePayment.domain.PaymentStatus;
import com.flowerapp.notification.service.EmailService;
import com.flowerapp.order.dto.OrderDto.*;
import com.flowerapp.order.entity.Order;
import com.flowerapp.order.entity.OrderItem;
import com.flowerapp.order.repository.OrderItemRepository;
import com.flowerapp.order.repository.OrderRepository;
import com.flowerapp.product.entity.Product;
import com.flowerapp.product.repository.ProductRepository;
import com.flowerapp.user.entity.User;
import com.flowerapp.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // ============ GUEST CHECKOUT - Create order without login ============
    /**
     * Create a guest order (no user account required)
     */
    public OrderResponse createGuestOrder(CreateOrderRequest request) {
        log.info("========== CREATING GUEST ORDER ==========");
        log.info("Guest Email: {}", request.getGuestEmail());
        log.info("Guest Phone: {}", request.getGuestPhone());

        // Validate guest email or phone is provided
        if ((request.getGuestEmail() == null || request.getGuestEmail().isEmpty()) &&
                (request.getGuestPhone() == null || request.getGuestPhone().isEmpty())) {
            throw CustomException.badRequest("Guest email or phone is required for guest checkout");
        }

        // Validate and process order items
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> CustomException.notFound("Product not found: " + itemRequest.getProductId()));

            if (!product.getIsActive()) {
                throw CustomException.badRequest("Product is not available: " + product.getProductName());
            }

            if (!product.isInStock() || product.getStockQuantity() < itemRequest.getQuantity()) {
                throw CustomException.badRequest("Insufficient stock for product: " + product.getProductName());
            }

            // Calculate item total
            BigDecimal itemTotal = product.getFinalPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            // Parse delivery date if provided
            LocalDate deliveryDate = null;
            if (itemRequest.getDeliveryDate() != null && !itemRequest.getDeliveryDate().isEmpty()) {
                try {
                    deliveryDate = LocalDate.parse(itemRequest.getDeliveryDate());
                } catch (Exception e) {
                    log.warn("Failed to parse delivery date: {}", itemRequest.getDeliveryDate());
                }
            }

            // Build order item
            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(product.getFinalPrice())
                    .totalPrice(itemTotal)
                    .productName(product.getProductName())
                    .productImageUrl(product.getImageUrl())
                    .specialInstructions(itemRequest.getSpecialInstructions())
                    .cardMessage(itemRequest.getCardMessage())
                    .deliveryDate(deliveryDate)
                    .deliveryTimeSlot(itemRequest.getDeliveryTimeSlot())
                    .build();

            orderItems.add(orderItem);
        }

        // Get delivery fee from request (default to 0 if not provided)
        BigDecimal deliveryFee = request.getDeliveryFee() != null ? request.getDeliveryFee() : BigDecimal.ZERO;

        // Calculate total amount = subtotal + deliveryFee
        BigDecimal totalAmount = subtotal.add(deliveryFee);

        // Create GUEST order (user = null)
        Order order = Order.builder()
                .user(null)  // No user for guest orders
                .isGuestOrder(true)
                .guestEmail(request.getGuestEmail())
                .guestPhone(request.getGuestPhone())
                .deliveryStatus(DeliveryStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .senderName(request.getSenderName())
                .senderPhone(request.getSenderPhone())
                .cardMessage(request.getCardMessage())
                .instructionMessage(request.getInstructionMessage())
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryArea(request.getDeliveryArea())
                .deliveryCity(request.getDeliveryCity())
                .deliveryNotes(request.getDeliveryNotes())
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .preferredDeliveryDate(request.getPreferredDeliveryDate())
                .subtotal(subtotal)
                .deliveryFee(deliveryFee)
                .totalAmount(totalAmount)
                .couponCode(request.getCouponCode())
                .build();

        Order savedOrder = orderRepository.save(order);

        // Save order items and decrease stock
        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);

            // Decrease product stock
            int updated = productRepository.decreaseStock(item.getProduct().getProductId(), item.getQuantity());
            if (updated == 0) {
                throw CustomException.badRequest("Failed to update stock for product: " + item.getProductName());
            }
        }

        log.info("Guest order created successfully!");
        log.info("Order ID: {}", savedOrder.getOrderId());
        log.info("Order Number: {}", savedOrder.getOrderNumber());
        log.info("Total Amount: {}", savedOrder.getTotalAmount());
        log.info("========== GUEST ORDER CREATED ==========");

        return mapToGuestOrderResponse(savedOrder, orderItems);
    }

    /**
     * Get guest order by order number and email (for order tracking)
     */
    @Transactional(readOnly = true)
    public OrderResponse getGuestOrderByOrderNumber(String orderNumber, String email) {
        log.info("Looking up guest order: {} for email: {}", orderNumber, email);

        Order order = orderRepository.findByOrderNumberAndGuestEmail(orderNumber, email)
                .orElseThrow(() -> CustomException.notFound(
                        "Order not found or email does not match"));

        List<OrderItem> items = orderItemRepository.findByOrderOrderId(order.getOrderId());
        return mapToGuestOrderResponse(order, items);
    }

    // ============ AUTHENTICATED USER - Create order with login ============
    /**
     * Create a new order for authenticated user
     */
    public OrderResponse createOrder(UUID userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("User not found"));

        // Validate and process order items
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> CustomException.notFound("Product not found: " + itemRequest.getProductId()));

            if (!product.getIsActive()) {
                throw CustomException.badRequest("Product is not available: " + product.getProductName());
            }

            if (!product.isInStock() || product.getStockQuantity() < itemRequest.getQuantity()) {
                throw CustomException.badRequest("Insufficient stock for product: " + product.getProductName());
            }

            // Calculate item total
            BigDecimal itemTotal = product.getFinalPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            // Parse delivery date if provided
            LocalDate deliveryDate = null;
            if (itemRequest.getDeliveryDate() != null && !itemRequest.getDeliveryDate().isEmpty()) {
                try {
                    deliveryDate = LocalDate.parse(itemRequest.getDeliveryDate());
                } catch (Exception e) {
                    log.warn("Failed to parse delivery date: {}", itemRequest.getDeliveryDate());
                }
            }

            // Build order item WITH card message and delivery date/time
            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(product.getFinalPrice())
                    .totalPrice(itemTotal)
                    .productName(product.getProductName())
                    .productImageUrl(product.getImageUrl())
                    .specialInstructions(itemRequest.getSpecialInstructions())
                    .cardMessage(itemRequest.getCardMessage())           // NEW
                    .deliveryDate(deliveryDate)                          // NEW
                    .deliveryTimeSlot(itemRequest.getDeliveryTimeSlot()) // NEW
                    .build();

            orderItems.add(orderItem);
        }

        // Get delivery fee from request (default to 0 if not provided)
        BigDecimal deliveryFee = request.getDeliveryFee() != null ? request.getDeliveryFee() : BigDecimal.ZERO;

        // Calculate total amount = subtotal + deliveryFee
        BigDecimal totalAmount = subtotal.add(deliveryFee);

        // Create order
        Order order = Order.builder()
                .user(user)
                .isGuestOrder(false)
                .deliveryStatus(DeliveryStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .senderName(request.getSenderName())              // NEW
                .senderPhone(request.getSenderPhone())            // NEW
                .cardMessage(request.getCardMessage())            // Order-level (fallback)
                .instructionMessage(request.getInstructionMessage())
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryArea(request.getDeliveryArea())
                .deliveryCity(request.getDeliveryCity())
                .deliveryNotes(request.getDeliveryNotes())
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .preferredDeliveryDate(request.getPreferredDeliveryDate())
                .subtotal(subtotal)
                .deliveryFee(deliveryFee)
                .totalAmount(totalAmount)
                .couponCode(request.getCouponCode())
                .build();

        Order savedOrder = orderRepository.save(order);

        // Save order items and decrease stock
        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);

            // Decrease product stock
            int updated = productRepository.decreaseStock(item.getProduct().getProductId(), item.getQuantity());
            if (updated == 0) {
                throw CustomException.badRequest("Failed to update stock for product: " + item.getProductName());
            }
        }

        log.info("Order created successfully: {}", savedOrder.getOrderNumber());
        return mapToOrderResponse(savedOrder, orderItems);
    }

    /**
     * Get order by ID (user must own the order)
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, UUID userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> CustomException.notFound("Order not found"));

        if (order.getUser() == null || !order.getUser().getUserId().equals(userId)) {
            throw CustomException.forbidden("You don't have access to this order");
        }

        return mapToOrderResponse(order, order.getOrderItems());
    }

    /**
     * Get order by ID (admin access - no ownership check)
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderByIdAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> CustomException.notFound("Order not found"));

        List<OrderItem> items = orderItemRepository.findByOrderOrderId(orderId);

        // Check if it's a guest order
        if (order.isGuest()) {
            return mapToGuestOrderResponse(order, items);
        }
        return mapToOrderResponse(order, items);
    }

    /**
     * Get order by order number
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumber(String orderNumber, UUID userId) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> CustomException.notFound("Order not found"));

        if (order.getUser() == null || !order.getUser().getUserId().equals(userId)) {
            throw CustomException.forbidden("You don't have access to this order");
        }

        List<OrderItem> items = orderItemRepository.findByOrderOrderId(order.getOrderId());
        return mapToOrderResponse(order, items);
    }

    /**
     * Get user's orders with pagination
     */
    @Transactional(readOnly = true)
    public Page<OrderListResponse> getUserOrders(UUID userId, Pageable pageable) {
        return orderRepository.findByUserUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToOrderListResponse);
    }

    /**
     * Get user's orders by delivery status
     */
    @Transactional(readOnly = true)
    public Page<OrderListResponse> getUserOrdersByDeliveryStatus(UUID userId, DeliveryStatus status, Pageable pageable) {
        return orderRepository.findByUserUserIdAndDeliveryStatus(userId, status, pageable)
                .map(this::mapToOrderListResponse);
    }

    /**
     * Cancel order (user can only cancel PENDING orders)
     */
    public OrderResponse cancelOrder(Long orderId, UUID userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> CustomException.notFound("Order not found"));

        if (order.getUser() == null || !order.getUser().getUserId().equals(userId)) {
            throw CustomException.forbidden("You don't have access to this order");
        }

        if (order.getDeliveryStatus() != DeliveryStatus.PENDING) {
            throw CustomException.badRequest("Only pending orders can be cancelled");
        }

        // Restore stock
        List<OrderItem> items = orderItemRepository.findByOrderOrderId(orderId);
        for (OrderItem item : items) {
            productRepository.increaseStock(item.getProduct().getProductId(), item.getQuantity());
        }

        order.setDeliveryStatus(DeliveryStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        log.info("Order cancelled: {}", order.getOrderNumber());
        return mapToOrderResponse(savedOrder, items);
    }

    /**
     * Update delivery status (admin only)
     */
    public OrderResponse updateDeliveryStatus(Long orderId, DeliveryStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> CustomException.notFound("Order not found"));

        DeliveryStatus oldStatus = order.getDeliveryStatus();

        // If cancelling, restore stock
        if (newStatus == DeliveryStatus.CANCELLED && oldStatus != DeliveryStatus.CANCELLED) {
            List<OrderItem> items = orderItemRepository.findByOrderOrderId(orderId);
            for (OrderItem item : items) {
                productRepository.increaseStock(item.getProduct().getProductId(), item.getQuantity());
            }
        }

        order.setDeliveryStatus(newStatus);

        // Update delivered time if applicable
        if (newStatus == DeliveryStatus.DELIVERED) {
            order.setActualDeliveryDate(LocalDateTime.now());
        }

        // Update cancelled time if applicable
        if (newStatus == DeliveryStatus.CANCELLED) {
            order.setCancelledAt(LocalDateTime.now());
        }

        Order savedOrder = orderRepository.save(order);

        // Send status update email - handle both guest and registered users
        try {
            String email = order.isGuest() ? order.getGuestEmail() : order.getUser().getEmail();
            if (email != null && !email.isEmpty()) {
                emailService.sendOrderStatusUpdateEmail(
                        email,
                        order.getOrderNumber(),
                        newStatus.name()
                );
            }
        } catch (Exception e) {
            log.error("Failed to send order status update email", e);
        }

        log.info("Order {} delivery status updated from {} to {}", order.getOrderNumber(), oldStatus, newStatus);

        List<OrderItem> items = orderItemRepository.findByOrderOrderId(orderId);

        if (order.isGuest()) {
            return mapToGuestOrderResponse(savedOrder, items);
        }
        return mapToOrderResponse(savedOrder, items);
    }

    /**
     * Update payment status
     */
    public void updatePaymentStatus(Long orderId, PaymentStatus paymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> CustomException.notFound("Order not found"));

        order.setPaymentStatus(paymentStatus);

        // If payment completed, confirm the order
        if (paymentStatus == PaymentStatus.COMPLETED && order.getDeliveryStatus() == DeliveryStatus.PENDING) {
            order.setDeliveryStatus(DeliveryStatus.CONFIRMED);
        }

        orderRepository.save(order);
        log.info("Order {} payment status updated to {}", order.getOrderNumber(), paymentStatus);
    }

    /**
     * Get all orders (admin)
     */
    @Transactional(readOnly = true)
    public Page<OrderListResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToOrderListResponse);
    }

    /**
     * Get orders by delivery status (admin)
     */
    @Transactional(readOnly = true)
    public Page<OrderListResponse> getOrdersByDeliveryStatus(DeliveryStatus status, Pageable pageable) {
        return orderRepository.findByDeliveryStatus(status, pageable)
                .map(this::mapToOrderListResponse);
    }

    /**
     * Get orders by date range (admin)
     */
    @Transactional(readOnly = true)
    public Page<OrderListResponse> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return orderRepository.findByCreatedAtBetween(startDate, endDate, pageable)
                .map(this::mapToOrderListResponse);
    }

    /**
     * Get order statistics (admin)
     */
    @Transactional(readOnly = true)
    public OrderStatistics getOrderStatistics() {
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByDeliveryStatus(DeliveryStatus.PENDING);
        long confirmedOrders = orderRepository.countByDeliveryStatus(DeliveryStatus.CONFIRMED);
        long processingOrders = orderRepository.countByDeliveryStatus(DeliveryStatus.PROCESSING);
        long deliveredOrders = orderRepository.countByDeliveryStatus(DeliveryStatus.DELIVERED);
        long cancelledOrders = orderRepository.countByDeliveryStatus(DeliveryStatus.CANCELLED);

        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        long todayOrders = orderRepository.countByCreatedAtAfter(todayStart);

        return OrderStatistics.builder()
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .confirmedOrders(confirmedOrders)
                .processingOrders(processingOrders)
                .deliveredOrders(deliveredOrders)
                .cancelledOrders(cancelledOrders)
                .totalRevenue(totalRevenue)
                .todayOrders(todayOrders)
                .build();
    }

    // ============ MAPPING METHODS ============

    /**
     * Map Order entity to OrderResponse DTO (for authenticated users)
     */
    private OrderResponse mapToOrderResponse(Order order, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());

        UserSummary userSummary = null;
        if (order.getUser() != null) {
            userSummary = UserSummary.builder()
                    .userId(order.getUser().getUserId())
                    .name(order.getUser().getName())
                    .email(order.getUser().getEmail())
                    .phone(order.getUser().getPhoneNumber())
                    .build();
        }

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .orderNumber(order.getOrderNumber())
                .deliveryStatus(order.getDeliveryStatus())
                .paymentStatus(order.getPaymentStatus())
                .isGuestOrder(order.getIsGuestOrder())
                .guestEmail(order.getGuestEmail())
                .senderName(order.getSenderName())
                .senderPhone(order.getSenderPhone())
                .cardMessage(order.getCardMessage())
                .instructionMessage(order.getInstructionMessage())
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .deliveryAddress(order.getDeliveryAddress())
                .deliveryArea(order.getDeliveryArea())
                .deliveryCity(order.getDeliveryCity())
                .deliveryNotes(order.getDeliveryNotes())
                .preferredDeliveryDate(order.getPreferredDeliveryDate())
                .actualDeliveryDate(order.getActualDeliveryDate())
                .subtotal(order.getSubtotal())
                .deliveryFee(order.getDeliveryFee())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .couponCode(order.getCouponCode())
                .items(itemResponses)
                .user(userSummary)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .cancelledAt(order.getCancelledAt())
                .cancellationReason(order.getCancellationReason())
                .build();
    }

    /**
     * Map Guest Order entity to OrderResponse DTO
     */
    private OrderResponse mapToGuestOrderResponse(Order order, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .orderNumber(order.getOrderNumber())
                .deliveryStatus(order.getDeliveryStatus())
                .paymentStatus(order.getPaymentStatus())
                .isGuestOrder(true)
                .guestEmail(order.getGuestEmail())
                .senderName(order.getSenderName())
                .senderPhone(order.getSenderPhone())
                .cardMessage(order.getCardMessage())
                .instructionMessage(order.getInstructionMessage())
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .deliveryAddress(order.getDeliveryAddress())
                .deliveryArea(order.getDeliveryArea())
                .deliveryCity(order.getDeliveryCity())
                .deliveryNotes(order.getDeliveryNotes())
                .preferredDeliveryDate(order.getPreferredDeliveryDate())
                .actualDeliveryDate(order.getActualDeliveryDate())
                .subtotal(order.getSubtotal())
                .deliveryFee(order.getDeliveryFee())
                .discountAmount(order.getDiscountAmount())
                .totalAmount(order.getTotalAmount())
                .couponCode(order.getCouponCode())
                .items(itemResponses)
                .user(null)  // No user for guest orders
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .cancelledAt(order.getCancelledAt())
                .cancellationReason(order.getCancellationReason())
                .build();
    }

    /**
     * Map Order entity to OrderListResponse DTO (summary)
     */
    private OrderListResponse mapToOrderListResponse(Order order) {
        int itemCount = orderItemRepository.countByOrderOrderId(order.getOrderId());

        UserSummary userSummary = null;
        if (order.getUser() != null) {
            userSummary = UserSummary.builder()
                    .userId(order.getUser().getUserId())
                    .name(order.getUser().getName())
                    .email(order.getUser().getEmail())
                    .phone(order.getUser().getPhoneNumber())
                    .build();
        }

        return OrderListResponse.builder()
                .orderId(order.getOrderId())
                .orderNumber(order.getOrderNumber())
                .deliveryStatus(order.getDeliveryStatus())
                .paymentStatus(order.getPaymentStatus())
                .totalAmount(order.getTotalAmount())
                .itemCount(itemCount)
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .deliveryArea(order.getDeliveryArea())
                .preferredDeliveryDate(order.getPreferredDeliveryDate())
                .createdAt(order.getCreatedAt())
                .user(userSummary)
                .isGuestOrder(order.getIsGuestOrder())
                .guestEmail(order.getGuestEmail())
                .build();
    }

    /**
     * Map OrderItem entity to OrderItemResponse DTO
     */
    private OrderItemResponse mapToOrderItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .orderItemId(item.getOrderItemId())
                .productId(item.getProduct().getProductId())
                .productName(item.getProductName())
                .productImageUrl(item.getProductImageUrl())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .specialInstructions(item.getSpecialInstructions())
                .cardMessage(item.getCardMessage())
                .deliveryDate(item.getDeliveryDate() != null ? item.getDeliveryDate().toString() : null)
                .deliveryTimeSlot(item.getDeliveryTimeSlot())
                .build();
    }
}