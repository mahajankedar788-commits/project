package com.ssit.examportal.controller;

import com.ssit.examportal.dto.ApiResponse;
import com.ssit.examportal.dto.SubjectAdminView;
import com.ssit.examportal.dto.SubjectRequest;
import com.ssit.examportal.service.SubjectService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/subjects")
public class AdminSubjectController {

    private final SubjectService subjectService;

    public AdminSubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @PostMapping
    public ApiResponse<SubjectAdminView> add(@Valid @RequestBody SubjectRequest request) {
        return ApiResponse.ok("Subject added.", subjectService.addSubject(request));
    }

    @GetMapping
    public ApiResponse<List<SubjectAdminView>> list() {
        return ApiResponse.ok(null, subjectService.listAll());
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> remove(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ApiResponse.ok("Subject removed.", null);
    }
}
