package com.ssit.examportal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "exam_answers",
    uniqueConstraints = @UniqueConstraint(columnNames = {"attempt_id", "question_id"})
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private ExamAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    /** Null until the student picks an option; also how "unanswered" is represented at submit time. */
    @Enumerated(EnumType.STRING)
    @Column(name = "selected_option")
    private OptionKey selectedOption;

    /** Filled in at submission time. */
    @Column(name = "is_correct")
    private Boolean isCorrect;
}
