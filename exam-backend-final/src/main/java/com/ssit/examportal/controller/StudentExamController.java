package com.ssit.examportal.controller;

import com.ssit.examportal.dto.AnswerRequest;
import com.ssit.examportal.dto.ApiResponse;
import com.ssit.examportal.dto.ExamAttemptView;
import com.ssit.examportal.dto.ExamResultView;
import com.ssit.examportal.dto.StudentExamListItem;
import com.ssit.examportal.dto.StudentResultListItem;
import com.ssit.examportal.service.ExamService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student")
public class StudentExamController {

    private final ExamService examService;

    public StudentExamController(ExamService examService) {
        this.examService = examService;
    }

    @GetMapping("/exams")
    public ApiResponse<List<StudentExamListItem>> myExams(Authentication authentication) {
        return ApiResponse.ok(null, examService.listForStudent(authentication.getName()));
    }

    @PostMapping("/exams/{examId}/start")
    public ApiResponse<ExamAttemptView> start(@PathVariable Long examId, Authentication authentication) {
        return ApiResponse.ok(null, examService.startOrResume(authentication.getName(), examId));
    }

    @PutMapping("/attempts/{attemptId}/answer")
    public ApiResponse<Void> saveAnswer(
            @PathVariable Long attemptId,
            @Valid @RequestBody AnswerRequest request,
            Authentication authentication
    ) {
        examService.saveAnswer(authentication.getName(), attemptId, request);
        return ApiResponse.ok(null, null);
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public ApiResponse<ExamResultView> submit(@PathVariable Long attemptId, Authentication authentication) {
        return ApiResponse.ok("Exam submitted.", examService.submit(authentication.getName(), attemptId));
    }

    @GetMapping("/results")
    public ApiResponse<List<StudentResultListItem>> myResults(Authentication authentication) {
        return ApiResponse.ok(null, examService.listResultsForStudent(authentication.getName()));
    }

    @GetMapping("/results/{attemptId}")
    public ApiResponse<ExamResultView> resultDetail(@PathVariable Long attemptId, Authentication authentication) {
        return ApiResponse.ok(null, examService.getResultDetail(authentication.getName(), attemptId));
    }
}
