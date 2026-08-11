package com.ssit.examportal.controller;

import com.ssit.examportal.dto.AdminPasswordResetResponse;
import com.ssit.examportal.dto.ApiResponse;
import com.ssit.examportal.dto.StudentAdminView;
import com.ssit.examportal.dto.StudentRegistrationRequest;
import com.ssit.examportal.dto.StudentRegistrationResponse;
import com.ssit.examportal.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/students")
public class AdminStudentController {

    private final StudentService studentService;

    public AdminStudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    public ApiResponse<StudentRegistrationResponse> register(@Valid @RequestBody StudentRegistrationRequest request) {
        StudentRegistrationResponse response = studentService.registerStudent(request);
        return ApiResponse.ok(
                "Student registered. Share these credentials securely — the password won't be shown again.",
                response
        );
    }

    @GetMapping
    public ApiResponse<List<StudentAdminView>> list(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Integer semester
    ) {
        List<StudentAdminView> students = (courseId != null && semester != null)
                ? studentService.listByCourseAndSemester(courseId, semester)
                : studentService.listAll();
        return ApiResponse.ok(null, students);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> remove(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ApiResponse.ok("Student registration removed.", null);
    }

    /**
     * Resets a student's password to a freshly generated one, shown once in
     * the response. There's no endpoint to view an existing password — it's
     * stored as a one-way hash and can't be recovered, only replaced.
     */
    @PostMapping("/{id}/reset-password")
    public ApiResponse<AdminPasswordResetResponse> resetPassword(@PathVariable Long id) {
        return ApiResponse.ok(
                "Password reset. Share this new password securely — it won't be shown again.",
                studentService.resetPassword(id)
        );
    }
}
