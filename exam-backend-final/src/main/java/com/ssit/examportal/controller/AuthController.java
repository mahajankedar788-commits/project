package com.ssit.examportal.controller;

import com.ssit.examportal.dto.*;
import com.ssit.examportal.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        // Returned directly (not wrapped in ApiResponse) to match the
        // frontend's { token, role, username, mustChangePassword } contract.
        return authService.login(request.getUsername(), request.getPassword());
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        authService.changePassword(
                authentication.getName(),
                request.getCurrentPassword(),
                request.getNewPassword()
        );
        return ApiResponse.ok("Password updated. Please sign in again.", null);
    }
}
