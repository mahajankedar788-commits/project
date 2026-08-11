package com.ssit.examportal.repository;

import com.ssit.examportal.entity.ExamAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExamAnswerRepository extends JpaRepository<ExamAnswer, Long> {
    List<ExamAnswer> findByAttemptId(Long attemptId);
    Optional<ExamAnswer> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
}
