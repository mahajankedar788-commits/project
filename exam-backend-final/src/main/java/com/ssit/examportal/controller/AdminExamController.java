package com.ssit.examportal.controller;

import com.ssit.examportal.dto.ApiResponse;
import com.ssit.examportal.dto.ExamAdminView;
import com.ssit.examportal.dto.ExamRequest;
import com.ssit.examportal.service.ExamService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/exams")
public class AdminExamController {

    private final ExamService examService;

    public AdminExamController(ExamService examService) {
        this.examService = examService;
    }

    @PostMapping
    public ApiResponse<ExamAdminView> schedule(@Valid @RequestBody ExamRequest request) {
        return ApiResponse.ok("Exam scheduled.", examService.schedule(request));
    }

    @GetMapping
    public ApiResponse<List<ExamAdminView>> list() {
        return ApiResponse.ok(null, examService.listAll());
    }

    @DeleteMapping("/{examId}")
    public ApiResponse<Void> delete(@PathVariable Long examId) {
        examService.delete(examId);
        return ApiResponse.ok("Exam deleted.", null);
    }
}
