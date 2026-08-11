package com.ssit.examportal.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Two supported modes:
 *  - Bulk, course-wide: set courseId + semester + subjectId
 *    -> allots the subject to every student in that course/semester.
 *  - Single override: set studentId + subjectId
 *    -> allots the subject to just that one student.
 */
@Data
public class AllotmentRequest {
    private Long studentId;
    private Long courseId;
    private Integer semester;

    @NotNull(message = "Subject is required")
    private Long subjectId;
}
