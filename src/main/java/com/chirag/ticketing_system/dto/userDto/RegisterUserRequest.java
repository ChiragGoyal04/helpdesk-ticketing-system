package com.chirag.ticketing_system.dto.userDto;

import com.chirag.ticketing_system.enums.Role;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

@Data

public class RegisterUserRequest {
    private String name;
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    private Role role;

}
