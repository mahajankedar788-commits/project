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
public class ExamResultView {
    private Long attemptId;
    private String examName;
    private String subjectName;
    private Integer totalScore;
    private Integer maxMarks;
    private Integer passingMarks;
    private boolean passed;
    private Instant submittedAt;
    private List<AnswerBreakdown> breakdown;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnswerBreakdown {
        private Long questionId;
        private String questionText;
        private String selectedOption;
        private String correctOption;
        private boolean correct;
        private Integer marks;
    }
}
