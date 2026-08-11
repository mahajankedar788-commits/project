package com.ssit.examportal.controller;

import com.ssit.examportal.dto.ApiResponse;
import com.ssit.examportal.dto.DashboardStatsView;
import com.ssit.examportal.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/dashboard")
public class AdminDashboardController {

    private final DashboardService dashboardService;

    public AdminDashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ApiResponse<DashboardStatsView> stats() {
        return ApiResponse.ok(null, dashboardService.getStats());
    }
}
