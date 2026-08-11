package com.ssit.examportal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StudentRegistrationRequest {
    @NotBlank(message = "Registration number is required")
    private String regNo;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Course is required")
    private Long courseId;

    @NotNull(message = "Semester is required")
    private Integer semester;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String mobile;
    private String photoUrl;
}
