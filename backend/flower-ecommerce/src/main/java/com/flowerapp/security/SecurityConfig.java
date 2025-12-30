package com.flowerapp.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flowerapp.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;
    private final ObjectMapper objectMapper;

    // Public endpoints that don't require authentication
    private static final String[] PUBLIC_ENDPOINTS = {
            "/auth/**",
            "/public/**",
            "/categories/**",
            "/products/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/api-docs/**",
            "/v3/api-docs/**",
            "/payments/callback",      // Hesabe callback - no auth
            "/payments/webhook",       // Hesabe webhook - no auth
            "/payments/verify",        // Payment verification - no auth
            "/payments/methods"        // Payment methods - public
    };

    // User endpoints (Role = 1, 2, 3) - Requires authentication
    private static final String[] USER_ENDPOINTS = {
            "/users/profile/**",
            "/orders/**",
            "/payments/**",
            "/api/cart/**",      // Cart endpoints - added for cart sync
            "/cart/**"           // Alternative cart path
    };

    // Admin endpoints (Role = 2, 3)
    private static final String[] ADMIN_ENDPOINTS = {
            "/admin/**"
    };

    // Super Admin endpoints (Role = 3)
    private static final String[] SUPER_ADMIN_ENDPOINTS = {
            "/admin/users/**",
            "/admin/roles/**",
            "/admin/system/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ============ PUBLIC ENDPOINTS (NO AUTH) ============
                        // IMPORTANT: Specific payment endpoints MUST come BEFORE general /payments/**
                        .requestMatchers("/payments/callback").permitAll()   // Hesabe callback - NO AUTH
                        .requestMatchers("/payments/webhook").permitAll()    // Hesabe webhook - NO AUTH
                        .requestMatchers("/payments/verify").permitAll()     // Payment verify - NO AUTH
                        .requestMatchers("/payments/methods").permitAll()    // Payment methods - NO AUTH
                        .requestMatchers(HttpMethod.GET, "/payments/methods/**").permitAll()

                        // Other public endpoints
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/public/**").permitAll()
                        .requestMatchers("/categories/**").permitAll()
                        .requestMatchers("/products/**").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/api-docs/**").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/categories/**", "/products/**").permitAll()

                        // ============ AUTHENTICATED ENDPOINTS ============
                        // Cart endpoints - authenticated users only
                        .requestMatchers("/api/cart/**").authenticated()
                        .requestMatchers("/cart/**").authenticated()

                        // User endpoints - authenticated users
                        .requestMatchers("/users/profile/**").authenticated()
                        .requestMatchers("/orders/**").authenticated()
                        .requestMatchers("/payments/**").authenticated()  // Other payment endpoints need auth

                        // ============ ADMIN ENDPOINTS ============
                        .requestMatchers("/admin/products/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/admin/categories/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/admin/orders/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/admin/customers/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers("/admin/dashboard/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                        // Super Admin only endpoints
                        .requestMatchers("/admin/users/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/admin/roles/**").hasRole("SUPER_ADMIN")
                        .requestMatchers("/admin/system/**").hasRole("SUPER_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/admin/admins/**").hasRole("SUPER_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/admin/admins/**").hasRole("SUPER_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/admin/admins/**").hasRole("SUPER_ADMIN")

                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            ApiResponse<?> apiResponse = ApiResponse.error(
                                    "Unauthorized access. Please login.", "UNAUTHORIZED");
                            response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            ApiResponse<?> apiResponse = ApiResponse.error(
                                    "Access denied. You don't have permission.", "FORBIDDEN");
                            response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
                        })
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:8080",
                "https://flowerapp.com",
                "https://hollandflowers.com",
                "https://flowerskw.com",
                "https://www.flowerskw.com",
//                "https://hollandflowers.onrender.com",
                "https://hollandflowers.onrender.com/api/v1",
                "https://holland-flowers.vercel.app",
                "https://holland-flowers-quv2xb80t-uvaachas-projects.vercel.app"
        ));
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization", "Content-Type", "X-Requested-With",
                "Accept", "Origin", "Access-Control-Request-Method",
                "Access-Control-Request-Headers"));
        configuration.setExposedHeaders(List.of(
                "Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}