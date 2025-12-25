package com.flowerapp.security;

import com.flowerapp.common.enums.RoleType;
import com.flowerapp.user.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

@Getter
public class CustomUserDetails implements UserDetails {

    private final UUID userId;
    private final String email;
    private final String password;
    private final Integer roleId;
    private final String roleName;
    private final boolean isActive;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(User user) {
        this.userId = user.getUserId();
        this.email = user.getEmail();
        this.password = user.getPassword();
        this.roleId = user.getRoleId();
        this.roleName = RoleType.fromRoleNumber(user.getRoleId()).name();
        this.isActive = user.getIsActive();
        this.authorities = Collections.singletonList(
                new SimpleGrantedAuthority(RoleType.fromRoleNumber(user.getRoleId()).getAuthority())
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isActive;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }

    public boolean hasRole(RoleType role) {
        return this.roleId.equals(role.getRoleNumber());
    }

    public boolean isAdmin() {
        return roleId >= RoleType.ADMIN.getRoleNumber();
    }

    public boolean isSuperAdmin() {
        return roleId.equals(RoleType.SUPER_ADMIN.getRoleNumber());
    }
}
