package com.flowerapp.otp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "otp", indexes = {
        @Index(name = "idx_otp_email_phone", columnList = "email_or_phone"),
        @Index(name = "idx_otp_expiry", columnList = "expiry_time")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Otp {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "otp_id", updatable = false, nullable = false)
    private UUID otpId;

    @Column(name = "email_or_phone", nullable = false, length = 150)
    private String emailOrPhone;

    @Column(name = "otp_code", nullable = false, length = 6)
    private String otpCode;

    @Column(name = "expiry_time", nullable = false)
    private LocalDateTime expiryTime;

    @Column(name = "is_used", nullable = false)
    @Builder.Default
    private Boolean isUsed = false;

    @Column(name = "purpose", length = 50)
    @Builder.Default
    private String purpose = "LOGIN";

    @Column(name = "attempts", nullable = false)
    @Builder.Default
    private Integer attempts = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryTime);
    }

    public boolean isValid() {
        return !isUsed && !isExpired();
    }

    public void incrementAttempts() {
        this.attempts++;
    }
}
