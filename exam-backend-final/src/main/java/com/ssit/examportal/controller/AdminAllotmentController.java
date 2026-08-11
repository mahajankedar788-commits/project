package com.ssit.examportal.controller;

import com.ssit.examportal.dto.AllotmentRequest;
import com.ssit.examportal.dto.AllotmentView;
import com.ssit.examportal.dto.ApiResponse;
import com.ssit.examportal.service.AllotmentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/allotment")
public class AdminAllotmentController {

    private final AllotmentService allotmentService;

    public AdminAllotmentController(AllotmentService allotmentService) {
        this.allotmentService = allotmentService;
    }

    @PostMapping
    public ApiResponse<List<AllotmentView>> allot(@Valid @RequestBody AllotmentRequest request) {
        List<AllotmentView> created = allotmentService.allot(request);
        return ApiResponse.ok(created.size() + " student(s) allotted this subject.", created);
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse<List<AllotmentView>> forStudent(@PathVariable Long studentId) {
        return ApiResponse.ok(null, allotmentService.listForStudent(studentId));
    }
}
