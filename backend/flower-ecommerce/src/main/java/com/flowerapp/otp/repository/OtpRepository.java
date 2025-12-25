package com.flowerapp.otp.repository;

import com.flowerapp.otp.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpRepository extends JpaRepository<Otp, UUID> {

    @Query("SELECT o FROM Otp o WHERE o.emailOrPhone = :emailOrPhone " +
           "AND o.isUsed = false AND o.expiryTime > :now " +
           "ORDER BY o.createdAt DESC LIMIT 1")
    Optional<Otp> findLatestValidOtp(@Param("emailOrPhone") String emailOrPhone, 
                                      @Param("now") LocalDateTime now);

    @Query("SELECT o FROM Otp o WHERE o.emailOrPhone = :emailOrPhone " +
           "AND o.otpCode = :otpCode AND o.isUsed = false AND o.expiryTime > :now")
    Optional<Otp> findValidOtp(@Param("emailOrPhone") String emailOrPhone,
                                @Param("otpCode") String otpCode,
                                @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE Otp o SET o.isUsed = true WHERE o.emailOrPhone = :emailOrPhone AND o.isUsed = false")
    void invalidateAllOtpsForUser(@Param("emailOrPhone") String emailOrPhone);

    @Modifying
    @Query("DELETE FROM Otp o WHERE o.expiryTime < :threshold")
    void deleteExpiredOtps(@Param("threshold") LocalDateTime threshold);

    @Query("SELECT COUNT(o) FROM Otp o WHERE o.emailOrPhone = :emailOrPhone " +
           "AND o.createdAt > :since AND o.isUsed = false")
    int countRecentOtps(@Param("emailOrPhone") String emailOrPhone, 
                        @Param("since") LocalDateTime since);

//    boolean existsByEmailOrPhoneAndIsUsedFalseAndExpiryTimeAfter(
//            String emailOrPhone, LocalDateTime now);
}
