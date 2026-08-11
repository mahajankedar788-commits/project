package com.ssit.examportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** One row per subject in the admin "Subject-wise" report — aggregated over every graded attempt on that subject. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectReportRow {
    private Long subjectId;
    private String subjectCode;
    private String subjectName;
    private String courseName;

    /** Graded attempts only (SUBMITTED or AUTO_SUBMITTED with a score recorded). */
    private long totalAttempts;

    /** Mean of each attempt's score expressed as a percentage of that subject's total marks, rounded to 1 decimal. */
    private Double averagePercentage;

    private long passCount;

    public Double getPassRatePercent() {
        if (totalAttempts == 0) return null;
        return Math.round((passCount * 1000.0) / totalAttempts) / 10.0;
    }
}
