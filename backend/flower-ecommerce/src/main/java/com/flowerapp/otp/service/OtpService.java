package com.flowerapp.otp.service;

import com.flowerapp.common.exception.CustomException;
import com.flowerapp.notification.service.EmailService;
import com.flowerapp.otp.entity.Otp;
import com.flowerapp.otp.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpRepository otpRepository;
    private final EmailService emailService;

    @Value("${otp.expiry-minutes:5}")
    private int otpExpiryMinutes;

    @Value("${otp.length:4}")
    private int otpLength;

    private static final int MAX_OTP_REQUESTS_PER_HOUR = 5;
    private static final int MAX_VERIFICATION_ATTEMPTS = 3;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public void generateAndSendOtp(String emailOrPhone) {
        generateAndSendOtp(emailOrPhone, "LOGIN");
    }

    @Transactional
    public void generateAndSendOtp(String emailOrPhone, String purpose) {
        log.info("Generating OTP for: {} with purpose: {}", emailOrPhone, purpose);

        // Rate limiting - check if too many OTPs requested
        int recentOtpCount = otpRepository.countRecentOtps(
                emailOrPhone,
                LocalDateTime.now().minusHours(1)
        );

        if (recentOtpCount >= MAX_OTP_REQUESTS_PER_HOUR) {
            throw new CustomException(
                    "Too many OTP requests. Please try again later.",
                    HttpStatus.TOO_MANY_REQUESTS,
                    "OTP_RATE_LIMIT"
            );
        }

        // Invalidate any existing OTPs
        otpRepository.invalidateAllOtpsForUser(emailOrPhone);

        // Generate new OTP
        String otpCode = generateOtpCode();

        Otp otp = Otp.builder()
                .emailOrPhone(emailOrPhone)
                .otpCode(otpCode)
                .expiryTime(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
                .isUsed(false)
                .purpose(purpose)
                .attempts(0)
                .build();

        otpRepository.save(otp);
        log.info("OTP generated and saved for: {}", emailOrPhone);

        // ⚠️ DEVELOPMENT ONLY - Log OTP for testing (Remove in production!)
        log.info("========================================");
        log.info("🔐 OTP CODE FOR {}: {}", emailOrPhone, otpCode);
        log.info("========================================");

        // Send OTP via email or SMS
        if (emailOrPhone.contains("@")) {
            sendOtpEmail(emailOrPhone, otpCode, purpose);
        } else {
            // TODO: Implement SMS service (Twilio, etc.)
            log.info("📱 SMS OTP would be sent to: {} with code: {}", emailOrPhone, otpCode);
        }
    }

    @Transactional
    public boolean verifyOtp(String emailOrPhone, String otpCode) {
        log.info("Verifying OTP for: {}", emailOrPhone);

        Otp otp = otpRepository.findValidOtp(
                emailOrPhone,
                otpCode,
                LocalDateTime.now()
        ).orElse(null);

        if (otp == null) {
            // Check if there's an OTP with too many attempts
            Otp existingOtp = otpRepository.findLatestValidOtp(
                    emailOrPhone,
                    LocalDateTime.now()
            ).orElse(null);

            if (existingOtp != null) {
                existingOtp.incrementAttempts();
                otpRepository.save(existingOtp);

                if (existingOtp.getAttempts() >= MAX_VERIFICATION_ATTEMPTS) {
                    existingOtp.setIsUsed(true);
                    otpRepository.save(existingOtp);
                    throw new CustomException(
                            "Too many failed attempts. Please request a new OTP.",
                            HttpStatus.BAD_REQUEST,
                            "OTP_MAX_ATTEMPTS"
                    );
                }
            }

            log.warn("Invalid OTP verification attempt for: {}", emailOrPhone);
            return false;
        }

        // Mark OTP as used
        otp.setIsUsed(true);
        otpRepository.save(otp);

        log.info("OTP verified successfully for: {}", emailOrPhone);
        return true;
    }

    @Transactional
    public void resendOtp(String emailOrPhone) {
        log.info("Resending OTP for: {}", emailOrPhone);

        // Check if there's a recent OTP
        Otp existingOtp = otpRepository.findLatestValidOtp(
                emailOrPhone,
                LocalDateTime.now()
        ).orElse(null);

        if (existingOtp != null) {
            // Resend the same OTP if it's still valid
            if (emailOrPhone.contains("@")) {
                sendOtpEmail(emailOrPhone, existingOtp.getOtpCode(), existingOtp.getPurpose());
            }
        } else {
            // Generate a new OTP
            generateAndSendOtp(emailOrPhone, "LOGIN");
        }
    }

    private String generateOtpCode() {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            otp.append(secureRandom.nextInt(10));
        }
        return otp.toString();
    }

    private void sendOtpEmail(String email, String otpCode, String purpose) {
        String subject;
        String body;

        switch (purpose) {
            case "SIGNUP", "VERIFY_EMAIL" -> {
                subject = "Verify Your Email - Flower App";
                body = buildVerificationEmailBody(otpCode);
            }
            case "RESET_PASSWORD" -> {
                subject = "Password Reset - Flower App";
                body = buildPasswordResetEmailBody(otpCode);
            }
            default -> {
                subject = "Your Login OTP - Flower App";
                body = buildLoginOtpEmailBody(otpCode);
            }
        }

        emailService.sendEmail(email, subject, body);
        log.info("OTP email sent to: {}", email);
    }

    private String buildLoginOtpEmailBody(String otpCode) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .otp-box { background: #f8f9fa; padding: 20px; text-align: center; 
                               border-radius: 8px; margin: 20px 0; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #e91e63; 
                                letter-spacing: 8px; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>🌸 Welcome to Flower App</h2>
                    <p>Your one-time password (OTP) for login is:</p>
                    <div class="otp-box">
                        <span class="otp-code">%s</span>
                    </div>
                    <p>This OTP is valid for %d minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <div class="footer">
                        <p>© 2024 Flower App. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, otpCode, otpExpiryMinutes);
    }

    private String buildVerificationEmailBody(String otpCode) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .otp-box { background: #e8f5e9; padding: 20px; text-align: center; 
                               border-radius: 8px; margin: 20px 0; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #4caf50; 
                                letter-spacing: 8px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>🌸 Verify Your Email</h2>
                    <p>Thank you for signing up! Please use the code below to verify your email:</p>
                    <div class="otp-box">
                        <span class="otp-code">%s</span>
                    </div>
                    <p>This code expires in %d minutes.</p>
                </div>
            </body>
            </html>
            """, otpCode, otpExpiryMinutes);
    }

    private String buildPasswordResetEmailBody(String otpCode) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .otp-box { background: #fff3e0; padding: 20px; text-align: center; 
                               border-radius: 8px; margin: 20px 0; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #ff9800; 
                                letter-spacing: 8px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>🔐 Password Reset Request</h2>
                    <p>Use the code below to reset your password:</p>
                    <div class="otp-box">
                        <span class="otp-code">%s</span>
                    </div>
                    <p>This code expires in %d minutes.</p>
                    <p><strong>If you didn't request this, please secure your account immediately.</strong></p>
                </div>
            </body>
            </html>
            """, otpCode, otpExpiryMinutes);
    }

    // Cleanup expired OTPs every hour
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanupExpiredOtps() {
        log.info("Cleaning up expired OTPs");
        otpRepository.deleteExpiredOtps(LocalDateTime.now().minusDays(1));
    }
}