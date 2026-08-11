package com.ssit.examportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/** One row per graded attempt (SUBMITTED or AUTO_SUBMITTED) — the summary list behind GET /student/results. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentResultListItem {
    private Long attemptId;
    private String examName;
    private String subjectName;
    private Integer totalScore;
    private Integer maxMarks;
    private Integer passingMarks;
    private boolean passed;
    private Instant submittedAt;
}
