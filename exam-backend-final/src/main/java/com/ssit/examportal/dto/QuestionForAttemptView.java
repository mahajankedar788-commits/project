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
public class QuestionForAttemptView {
    private Long questionId;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private Integer marks;

    /** The student's currently saved answer for this question, if any (null when unanswered). */
    private OptionKey selectedOption;

    public static QuestionForAttemptView from(Question q, OptionKey selectedOption) {
        return QuestionForAttemptView.builder()
                .questionId(q.getId())
                .questionText(q.getQuestionText())
                .optionA(q.getOptionA())
                .optionB(q.getOptionB())
                .optionC(q.getOptionC())
                .optionD(q.getOptionD())
                .marks(q.getMarks())
                .selectedOption(selectedOption)
                .build();
    }
}
