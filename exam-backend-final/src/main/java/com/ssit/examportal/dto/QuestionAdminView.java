package com.ssit.examportal.dto;

import com.ssit.examportal.entity.OptionKey;
import com.ssit.examportal.entity.Question;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionAdminView {
    private Long id;
    private Long subjectId;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private OptionKey correctOption;
    private Integer marks;

    public static QuestionAdminView from(Question q) {
        return QuestionAdminView.builder()
                .id(q.getId())
                .subjectId(q.getSubject().getId())
                .questionText(q.getQuestionText())
                .optionA(q.getOptionA())
                .optionB(q.getOptionB())
                .optionC(q.getOptionC())
                .optionD(q.getOptionD())
                .correctOption(q.getCorrectOption())
                .marks(q.getMarks())
                .build();
    }
}
