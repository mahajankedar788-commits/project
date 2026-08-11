package com.ssit.examportal.controller;

import com.ssit.examportal.dto.ApiResponse;
import com.ssit.examportal.dto.StudentProfileView;
import com.ssit.examportal.dto.UpdateProfileRequest;
import com.ssit.examportal.service.StudentProfileService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/student/profile")
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    public StudentProfileController(StudentProfileService studentProfileService) {
        this.studentProfileService = studentProfileService;
    }

    @GetMapping
    public ApiResponse<StudentProfileView> getProfile(Authentication authentication) {
        return ApiResponse.ok(null, studentProfileService.getProfile(authentication.getName()));
    }

    @PutMapping
    public ApiResponse<StudentProfileView> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        return ApiResponse.ok(
                "Profile updated.",
                studentProfileService.updateProfile(authentication.getName(), request)
        );
    }
}
