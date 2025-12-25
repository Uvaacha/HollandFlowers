package com.flowerapp.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RoleType {
    USER(1, "ROLE_USER"),
    ADMIN(2, "ROLE_ADMIN"),
    SUPER_ADMIN(3, "ROLE_SUPER_ADMIN");

    private final int roleNumber;
    private final String authority;

    public static RoleType fromRoleNumber(int roleNumber) {
        for (RoleType role : values()) {
            if (role.roleNumber == roleNumber) {
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid role number: " + roleNumber);
    }

    public static RoleType fromAuthority(String authority) {
        for (RoleType role : values()) {
            if (role.authority.equals(authority)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid authority: " + authority);
    }
}
