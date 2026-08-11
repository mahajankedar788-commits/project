package com.ssit.examportal.dto;

import com.ssit.examportal.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Role role;
    private String username;
    private boolean mustChangePassword;
}
