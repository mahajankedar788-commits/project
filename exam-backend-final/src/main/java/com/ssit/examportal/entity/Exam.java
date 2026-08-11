package com.ssit.examportal.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "exams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    /** Admin-facing label distinguishing this scheduled sitting from others on the same subject (e.g. "Mid-semester test"). */
    @Column(name = "exam_name", nullable = false)
    private String examName;

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "end_time", nullable = false)
    private Instant endTime;

    /** Per-student time limit once they start — may be shorter than the overall exam window. */
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    /** How many questions to randomly draw from the subject's question bank per attempt. */
    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;
}
