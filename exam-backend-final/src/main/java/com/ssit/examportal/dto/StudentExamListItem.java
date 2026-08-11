package com.ssit.examportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentExamListItem {
    private Long examId;
    private String subjectName;
    private Instant startTime;
    private Instant endTime;
    private Integer durationMinutes;

    /** NOT_STARTED | IN_PROGRESS | SUBMITTED | AUTO_SUBMITTED */
    private String attemptStatus;

    /** Populated only once the attempt is submitted. */
    private Integer score;
}
