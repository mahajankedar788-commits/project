package com.ssit.examportal.dto;

import com.ssit.examportal.entity.OptionKey;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class QuestionRequest {
    @NotNull(message = "Subject is required")
    private Long subjectId;

    @NotBlank(message = "Question text is required")
    private String questionText;

    @NotBlank(message = "Option A is required")
    private String optionA;

    @NotBlank(message = "Option B is required")
    private String optionB;

    @NotBlank(message = "Option C is required")
    private String optionC;

    @NotBlank(message = "Option D is required")
    private String optionD;

    @NotNull(message = "Correct option is required")
    private OptionKey correctOption;

    @NotNull(message = "Marks is required")
    @Positive(message = "Marks must be positive")
    private Integer marks;
}
