package com.ssit.examportal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Students can self-update their contact details only — regNo, name, course, and semester stay admin-managed. */
@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    private String email;

    private String mobile;
}
