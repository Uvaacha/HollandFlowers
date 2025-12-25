package com.flowerapp.security;

import com.flowerapp.common.enums.RoleType;
import com.flowerapp.common.exception.CustomException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return generateToken(userDetails);
    }

    public String generateToken(CustomUserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userDetails.getUserId());
        claims.put("email", userDetails.getEmail());
        claims.put("roleId", userDetails.getRoleId());
        claims.put("roleName", userDetails.getRoleName());

        return buildToken(claims, userDetails.getUsername(), jwtExpiration);
    }

    public String generateRefreshToken(CustomUserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userDetails.getUserId());
        claims.put("type", "refresh");

        return buildToken(claims, userDetails.getUsername(), refreshExpiration);
    }

    private String buildToken(Map<String, Object> claims, String subject, long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .id(UUID.randomUUID().toString())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public UUID extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        String userIdStr = claims.get("userId", String.class);
        return UUID.fromString(userIdStr);
    }

    public String extractEmail(String token) {
        return extractClaim(token, claims -> claims.get("email", String.class));
    }

    public Integer extractRoleId(String token) {
        return extractClaim(token, claims -> claims.get("roleId", Integer.class));
    }

    public RoleType extractRole(String token) {
        Integer roleId = extractRoleId(token);
        return RoleType.fromRoleNumber(roleId);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new CustomException("JWT token has expired", HttpStatus.UNAUTHORIZED, "TOKEN_EXPIRED");
        } catch (MalformedJwtException e) {
            throw new CustomException("Invalid JWT token", HttpStatus.UNAUTHORIZED, "INVALID_TOKEN");
        } catch (SignatureException e) {
            throw new CustomException("Invalid JWT signature", HttpStatus.UNAUTHORIZED, "INVALID_SIGNATURE");
        } catch (UnsupportedJwtException e) {
            throw new CustomException("Unsupported JWT token", HttpStatus.UNAUTHORIZED, "UNSUPPORTED_TOKEN");
        } catch (IllegalArgumentException e) {
            throw new CustomException("JWT claims string is empty", HttpStatus.UNAUTHORIZED, "EMPTY_CLAIMS");
        }
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }
}
