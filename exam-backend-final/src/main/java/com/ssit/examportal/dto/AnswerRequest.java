package com.ssit.examportal.dto;

import com.ssit.examportal.entity.OptionKey;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AnswerRequest {
    @NotNull(message = "Question is required")
    private Long questionId;

    /** Null clears/unanswers the question. */
    private OptionKey selectedOption;
}
