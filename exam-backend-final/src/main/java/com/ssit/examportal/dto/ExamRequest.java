package com.ssit.examportal.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.Instant;

@Data
public class ExamRequest {
    @NotBlank(message = "Exam name is required")
    private String examName;

    @NotNull(message = "Subject is required")
    private Long subjectId;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    private Instant startTime;

    @NotNull(message = "End time is required")
    private Instant endTime;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    private Integer durationMinutes;

    @NotNull(message = "Total questions is required")
    @Positive(message = "Total questions must be positive")
    private Integer totalQuestions;
}
