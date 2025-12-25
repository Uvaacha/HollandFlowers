package com.flowerapp.user.service;

import com.flowerapp.common.enums.RoleType;
import com.flowerapp.common.exception.CustomException;
import com.flowerapp.notification.service.EmailService;
import com.flowerapp.otp.service.OtpService;
import com.flowerapp.security.CustomUserDetails;
import com.flowerapp.security.JwtTokenProvider;
import com.flowerapp.user.dto.UserDto.*;
import com.flowerapp.user.entity.User;
import com.flowerapp.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;
    private final EmailService emailService;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        log.info("Processing signup for email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException("Email already registered", HttpStatus.CONFLICT, "EMAIL_EXISTS");
        }

        // Check if phone number already exists (if provided)
        if (request.getPhoneNumber() != null &&
                userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new CustomException("Phone number already registered", HttpStatus.CONFLICT, "PHONE_EXISTS");
        }

        // Create new user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase().trim())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .roleId(RoleType.USER.getRoleNumber())
                .isActive(true)
                .isEmailVerified(false)
                .build();

        user = userRepository.save(user);
        log.info("User created successfully with ID: {}", user.getUserId());

        // Send verification email
        try {
            otpService.generateAndSendOtp(user.getEmail());
            log.info("Verification OTP sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send verification OTP: {}", e.getMessage());
        }

        // Generate tokens
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtTokenProvider.generateToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400L)
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Processing login for email: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        // Update last login time
        userRepository.updateLastLoginTime(userDetails.getUserId(), LocalDateTime.now());

        String accessToken = jwtTokenProvider.generateToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        User user = userRepository.findById(userDetails.getUserId())
                .orElseThrow(() -> CustomException.notFound("User"));

        log.info("User logged in successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400L)
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public void requestOtpLogin(OtpLoginRequest request) {
        String emailOrPhone = request.getEmailOrPhone().trim();
        log.info("OTP login requested for: {}", emailOrPhone);

        // Check if user exists
        User user = findByEmailOrPhone(emailOrPhone);

        if (user == null) {
            throw new CustomException(
                    "No account found with this email or phone number. Please sign up first.",
                    HttpStatus.NOT_FOUND,
                    "USER_NOT_FOUND"
            );
        }

        if (!user.getIsActive()) {
            throw new CustomException("Account is disabled. Please contact support.", HttpStatus.FORBIDDEN, "ACCOUNT_DISABLED");
        }

        // Use the stored email/phone for OTP (ensures correct format)
        String otpDestination = emailOrPhone.contains("@") ? user.getEmail() : user.getPhoneNumber();
        otpService.generateAndSendOtp(otpDestination);
        log.info("OTP sent successfully to: {}", otpDestination);
    }

    @Transactional
    public AuthResponse verifyOtpLogin(OtpVerifyRequest request) {
        String emailOrPhone = request.getEmailOrPhone().trim();
        log.info("Verifying OTP for: {}", emailOrPhone);

        // Find user first
        User user = findByEmailOrPhone(emailOrPhone);

        if (user == null) {
            throw new CustomException(
                    "No account found with this email or phone number.",
                    HttpStatus.NOT_FOUND,
                    "USER_NOT_FOUND"
            );
        }

        if (!user.getIsActive()) {
            throw new CustomException("Account is disabled. Please contact support.", HttpStatus.FORBIDDEN, "ACCOUNT_DISABLED");
        }

        // Use the stored email/phone for OTP verification (ensures correct format)
        String otpDestination = emailOrPhone.contains("@") ? user.getEmail() : user.getPhoneNumber();

        // Verify OTP
        boolean isValid = otpService.verifyOtp(otpDestination, request.getOtp());
        if (!isValid) {
            throw new CustomException("Invalid or expired OTP. Please try again.", HttpStatus.BAD_REQUEST, "INVALID_OTP");
        }

        // Mark email/phone as verified
        if (emailOrPhone.contains("@")) {
            userRepository.verifyEmail(user.getUserId());
        } else {
            userRepository.verifyPhone(user.getUserId());
        }

        // Update last login
        userRepository.updateLastLoginTime(user.getUserId(), LocalDateTime.now());

        // Generate tokens
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtTokenProvider.generateToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        log.info("OTP verified and user logged in: {}", user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400L)
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        log.info("Processing token refresh");

        if (!jwtTokenProvider.validateToken(request.getRefreshToken())) {
            throw new CustomException("Invalid refresh token", HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN");
        }

        UUID userId = jwtTokenProvider.extractUserId(request.getRefreshToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("User"));

        if (!user.getIsActive()) {
            throw new CustomException("Account is disabled", HttpStatus.FORBIDDEN, "ACCOUNT_DISABLED");
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtTokenProvider.generateToken(userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400L)
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("User"));
        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("User"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        if (request.getPhoneNumber() != null) {
            if (userRepository.existsByPhoneNumber(request.getPhoneNumber()) &&
                    !request.getPhoneNumber().equals(user.getPhoneNumber())) {
                throw new CustomException("Phone number already in use", HttpStatus.CONFLICT, "PHONE_EXISTS");
            }
            user.setPhoneNumber(request.getPhoneNumber());
            user.setIsPhoneVerified(false);
        }

        user = userRepository.save(user);
        log.info("Profile updated for user: {}", userId);

        return mapToUserResponse(user);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw CustomException.badRequest("New password and confirm password do not match");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("User"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new CustomException("Current password is incorrect", HttpStatus.BAD_REQUEST, "INVALID_PASSWORD");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed for user: {}", userId);
    }

    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> CustomException.notFound("User with this email"));

        otpService.generateAndSendOtp(user.getEmail(), "RESET_PASSWORD");
        log.info("Password reset OTP sent to: {}", request.getEmail());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp());
        if (!isValid) {
            throw new CustomException("Invalid or expired OTP", HttpStatus.BAD_REQUEST, "INVALID_OTP");
        }

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> CustomException.notFound("User"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password reset successful for: {}", request.getEmail());
    }

    private User findByEmailOrPhone(String emailOrPhone) {
        // First try exact match
        Optional<User> user = userRepository.findByEmailOrPhoneNumber(emailOrPhone, emailOrPhone);

        if (user.isPresent()) {
            return user.get();
        }

        // If not found and it's a phone number, try with common country codes
        if (!emailOrPhone.contains("@")) {
            // Clean the phone number (remove spaces, dashes)
            String cleanPhone = emailOrPhone.replaceAll("[\\s\\-]", "");

            // If doesn't start with +, try common country code prefixes
            if (!cleanPhone.startsWith("+")) {
                String[] commonPrefixes = {"+965", "+966", "+971", "+973", "+974", "+968", "+91", "+92", "+63", "+20", "+962", "+961", "+1", "+44"};

                for (String prefix : commonPrefixes) {
                    java.util.Optional<User> userWithPrefix = userRepository.findByPhoneNumber(prefix + cleanPhone);
                    if (userWithPrefix.isPresent()) {
                        return userWithPrefix.get();
                    }
                }
            }

            // Also try searching by phone number ending (last 8 digits)
            if (cleanPhone.length() >= 8) {
                String lastDigits = cleanPhone.substring(cleanPhone.length() - 8);
                Optional<User> userByEnding = userRepository.findByPhoneNumberEndingWith(lastDigits);
                if (userByEnding.isPresent()) {
                    return userByEnding.get();
                }
            }
        }

        return null;
    }

    public UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .roleId(user.getRoleId())
                .roleName(RoleType.fromRoleNumber(user.getRoleId()).name())
                .isActive(user.getIsActive())
                .isEmailVerified(user.getIsEmailVerified())
                .isPhoneVerified(user.getIsPhoneVerified())
                .profileImageUrl(user.getProfileImageUrl())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }

    /**
     * Find user by JWT token
     * @param jwt The JWT token (with or without "Bearer " prefix)
     * @return The User entity
     */
    public User findUserProfileByJwt(String jwt) {
        // Remove "Bearer " prefix if present
        String token = jwt;
        if (jwt != null && jwt.startsWith("Bearer ")) {
            token = jwt.substring(7);
        }

        if (!jwtTokenProvider.validateToken(token)) {
            throw new CustomException("Invalid or expired token", HttpStatus.UNAUTHORIZED, "INVALID_TOKEN");
        }

        UUID userId = jwtTokenProvider.extractUserId(token);
        return userRepository.findById(userId)
                .orElseThrow(() -> CustomException.notFound("User"));
    }
}