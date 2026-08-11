package com.ssit.examportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAttemptView {
    private Long attemptId;
    private Long examId;
    private String subjectName;

    /** The server-authoritative deadline for this attempt — the client timer should count down to this. */
    private Instant expiresAt;

    private List<QuestionForAttemptView> questions;
}
