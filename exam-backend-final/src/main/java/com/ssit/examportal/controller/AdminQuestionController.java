package com.ssit.examportal.controller;

import com.ssit.examportal.dto.ApiResponse;
import com.ssit.examportal.dto.QuestionAdminView;
import com.ssit.examportal.dto.QuestionRequest;
import com.ssit.examportal.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/questions")
public class AdminQuestionController {

    private final QuestionService questionService;

    public AdminQuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping
    public ApiResponse<QuestionAdminView> add(@Valid @RequestBody QuestionRequest request) {
        return ApiResponse.ok("Question added.", questionService.add(request));
    }

    @PutMapping("/{questionId}")
    public ApiResponse<QuestionAdminView> update(
            @PathVariable Long questionId,
            @Valid @RequestBody QuestionRequest request
    ) {
        return ApiResponse.ok("Question updated.", questionService.update(questionId, request));
    }

    @DeleteMapping("/{questionId}")
    public ApiResponse<Void> delete(@PathVariable Long questionId) {
        questionService.delete(questionId);
        return ApiResponse.ok("Question deleted.", null);
    }

    @GetMapping
    public ApiResponse<List<QuestionAdminView>> listBySubject(@RequestParam Long subjectId) {
        return ApiResponse.ok(null, questionService.listBySubject(subjectId));
    }
}
