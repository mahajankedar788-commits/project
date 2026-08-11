package com.ssit.examportal.dto;

import com.ssit.examportal.entity.Exam;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAdminView {
    private Long id;
    private String examName;
    private Long subjectId;
    private String subjectName;
    private Instant startTime;
    private Instant endTime;
    private Integer durationMinutes;
    private Integer totalQuestions;

    public static ExamAdminView from(Exam e) {
        return ExamAdminView.builder()
                .id(e.getId())
                .examName(e.getExamName())
                .subjectId(e.getSubject().getId())
                .subjectName(e.getSubject().getSubjectName())
                .startTime(e.getStartTime())
                .endTime(e.getEndTime())
                .durationMinutes(e.getDurationMinutes())
                .totalQuestions(e.getTotalQuestions())
                .build();
    }
}
