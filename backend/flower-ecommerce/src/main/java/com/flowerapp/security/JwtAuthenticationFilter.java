package com.flowerapp.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String path = request.getServletPath();
        String uri = request.getRequestURI();

        log.info("========== JWT FILTER START ==========");
        log.info("ServletPath: {}", path);
        log.info("RequestURI: {}", uri);
        log.info("Authorization Header present: {}", request.getHeader(AUTHORIZATION_HEADER) != null);

        try {
            String jwt = extractJwtFromRequest(request);
            log.info("JWT Token extracted: {}", jwt != null ? "YES (length: " + jwt.length() + ")" : "NO");

            if (StringUtils.hasText(jwt)) {
                boolean isValid = jwtTokenProvider.validateToken(jwt);
                log.info("JWT Token valid: {}", isValid);

                if (isValid) {
                    String email = jwtTokenProvider.extractUsername(jwt);
                    log.info("Email from token: {}", email);

                    if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                        log.info("UserDetails loaded: {}", userDetails != null);
                        log.info("UserDetails authorities: {}", userDetails != null ? userDetails.getAuthorities() : "null");

                        if (jwtTokenProvider.isTokenValid(jwt, userDetails)) {
                            UsernamePasswordAuthenticationToken authToken =
                                    new UsernamePasswordAuthenticationToken(
                                            userDetails,
                                            null,
                                            userDetails.getAuthorities()
                                    );

                            authToken.setDetails(
                                    new WebAuthenticationDetailsSource().buildDetails(request)
                            );

                            SecurityContextHolder.getContext().setAuthentication(authToken);
                            log.info("SUCCESS: Authentication set for user: {}", email);
                            log.info("SUCCESS: Authorities: {}", userDetails.getAuthorities());
                        } else {
                            log.warn("Token validation failed for user: {}", email);
                        }
                    } else {
                        log.info("Skipping: email={}, existingAuth={}", email,
                                SecurityContextHolder.getContext().getAuthentication() != null);
                    }
                }
            } else {
                log.info("No JWT token found in request");
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage(), e);
        }

        log.info("========== JWT FILTER END ==========");
        filterChain.doFilter(request, response);
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        log.info("Raw Authorization header: {}", bearerToken != null ?
                bearerToken.substring(0, Math.min(bearerToken.length(), 30)) + "..." : "null");

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }

        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        String uri = request.getRequestURI();

        log.info(">>>>> shouldNotFilter check - ServletPath: {}, URI: {}", path, uri);

        // Always process JWT for test-auth endpoint (for debugging)
        if (path.contains("/public/test-auth") || uri.contains("/public/test-auth")) {
            log.info(">>>>> WILL FILTER (test-auth endpoint)");
            return false; // DO process the JWT for this endpoint
        }

        // Always process JWT for admin endpoints
        if (path.contains("/admin/") || uri.contains("/admin/")) {
            log.info(">>>>> WILL FILTER (admin endpoint)");
            return false; // DO process the JWT for admin endpoints
        }

        // Skip filter for public endpoints (no JWT processing needed)
        boolean skip = path.contains("/auth/") ||
                path.contains("/public/") ||
                uri.contains("/auth/") ||
                uri.contains("/public/") ||
                path.startsWith("/swagger-ui") ||
                path.startsWith("/api-docs") ||
                path.startsWith("/v3/api-docs");

        log.info(">>>>> shouldNotFilter result: {} (skip={})", skip ? "SKIP FILTER" : "WILL FILTER", skip);
        return skip;
    }
}