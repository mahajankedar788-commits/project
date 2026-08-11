package com.ssit.examportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** One row per student in the admin "Student-wise" report — aggregated over that student's own graded attempts. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentReportRow {
    private Long studentId;
    private String regNo;
    private String name;
    private String courseName;

    private long examsAttempted;
    private Double averagePercentage;
    private long passCount;

    public Double getPassRatePercent() {
        if (examsAttempted == 0) return null;
        return Math.round((passCount * 1000.0) / examsAttempted) / 10.0;
    }
}
