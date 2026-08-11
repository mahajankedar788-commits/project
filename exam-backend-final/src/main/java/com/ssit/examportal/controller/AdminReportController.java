package com.ssit.examportal.controller;

import com.ssit.examportal.dto.ApiResponse;
import com.ssit.examportal.dto.CourseReportRow;
import com.ssit.examportal.dto.StudentReportRow;
import com.ssit.examportal.dto.SubjectReportRow;
import com.ssit.examportal.service.ReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/reports")
public class AdminReportController {

    private final ReportService reportService;

    public AdminReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/subjects")
    public ApiResponse<List<SubjectReportRow>> subjects() {
        return ApiResponse.ok(null, reportService.subjectReport());
    }

    @GetMapping("/courses")
    public ApiResponse<List<CourseReportRow>> courses() {
        return ApiResponse.ok(null, reportService.courseReport());
    }

    @GetMapping("/students")
    public ApiResponse<List<StudentReportRow>> students() {
        return ApiResponse.ok(null, reportService.studentReport());
    }
}
