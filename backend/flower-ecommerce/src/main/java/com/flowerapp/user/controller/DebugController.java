package com.flowerapp.user.controller;

import com.flowerapp.common.response.ApiResponse;
import com.flowerapp.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/public")
@Tag(name = "Public Debug", description = "Public endpoints for debugging")
public class DebugController {

    @GetMapping("/test-auth")
    @Operation(summary = "Test authentication", description = "Check current user's authentication status and roles")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testAuth() {
        Map<String, Object> debugInfo = new HashMap<>();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null) {
            debugInfo.put("authenticated", false);
            debugInfo.put("message", "No authentication found in SecurityContext");
            return ResponseEntity.ok(ApiResponse.success("Auth debug", debugInfo));
        }

        debugInfo.put("authenticated", auth.isAuthenticated());
        debugInfo.put("principal", auth.getPrincipal().toString());
        debugInfo.put("principalClass", auth.getPrincipal().getClass().getSimpleName());
        debugInfo.put("authorities", auth.getAuthorities().toString());
        debugInfo.put("name", auth.getName());

        if (auth.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            debugInfo.put("userId", userDetails.getUserId().toString());
            debugInfo.put("email", userDetails.getEmail());
            debugInfo.put("roleId", userDetails.getRoleId());
            debugInfo.put("roleName", userDetails.getRoleName());
            debugInfo.put("isActive", userDetails.isEnabled());
        }

        log.info("========== DEBUG AUTH INFO ==========");
        log.info("Authentication: {}", auth);
        log.info("Authorities: {}", auth.getAuthorities());
        log.info("Principal class: {}", auth.getPrincipal().getClass().getSimpleName());
        log.info("=====================================");

        return ResponseEntity.ok(ApiResponse.success("Auth debug info", debugInfo));
    }

    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Simple health check endpoint")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("Server is running", "OK"));
    }
}