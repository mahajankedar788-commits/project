package com.ssit.examportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** One row per course in the admin "Course-wise" report — aggregated over every graded attempt across that course's subjects. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseReportRow {
    private Long courseId;
    private String courseName;

    private long totalAttempts;
    private Double averagePercentage;
    private long passCount;

    public Double getPassRatePercent() {
        if (totalAttempts == 0) return null;
        return Math.round((passCount * 1000.0) / totalAttempts) / 10.0;
    }
}
