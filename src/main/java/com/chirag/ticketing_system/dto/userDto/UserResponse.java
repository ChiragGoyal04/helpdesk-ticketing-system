package com.chirag.ticketing_system.dto.userDto;

import com.chirag.ticketing_system.enums.Role;
import lombok.Data;

@Data
public class UserResponse {

    private String name;
    private String email;
    private Role role;

}
