package com.ssit.examportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsView {
    private long registeredStudents;
    private long activeSubjects;
    private long examsScheduled;

    /** Percentage of graded attempts that met the subject's passing marks, rounded to 1 decimal. Null if no attempts have been graded yet. */
    private Double overallPassRate;

    /** How many attempts the pass rate above is based on, so the UI can show "no data yet" instead of a misleading 0%. */
    private long gradedAttempts;
}
