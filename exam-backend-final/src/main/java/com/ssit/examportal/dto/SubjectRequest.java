package com.ssit.examportal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class SubjectRequest {
    @NotBlank(message = "Subject code is required")
    private String subjectCode;

    @NotBlank(message = "Subject name is required")
    private String subjectName;

    @NotNull(message = "Course is required")
    private Long courseId;

    @NotNull(message = "Semester is required")
    private Integer semester;

    @NotNull(message = "Total marks is required")
    @Positive(message = "Total marks must be positive")
    private Integer totalMarks;

    @NotNull(message = "Passing marks is required")
    @Positive(message = "Passing marks must be positive")
    private Integer passingMarks;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    private Integer durationMinutes;
}
