package com.flowerapp.security;

import com.flowerapp.user.entity.User;
import com.flowerapp.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("Loading user by email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found with email: {}", email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });

        if (!user.getIsActive()) {
            log.warn("User account is disabled: {}", email);
            throw new UsernameNotFoundException("User account is disabled");
        }

        // Debug logging - REMOVE IN PRODUCTION
        log.info("========================================");
        log.info("USER LOADED FROM DATABASE");
        log.info("Email: {}", user.getEmail());
        log.info("RoleId from DB: {}", user.getRoleId());
        log.info("Is Active: {}", user.getIsActive());

        CustomUserDetails userDetails = new CustomUserDetails(user);
        log.info("Authorities created: {}", userDetails.getAuthorities());
        log.info("========================================");

        return userDetails;
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(UUID userId) {
        log.debug("Loading user by ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", userId);
                    return new UsernameNotFoundException("User not found with ID: " + userId);
                });

        if (!user.getIsActive()) {
            log.warn("User account is disabled: {}", user.getEmail());
            throw new UsernameNotFoundException("User account is disabled");
        }

        return new CustomUserDetails(user);
    }
}