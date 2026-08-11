package com.ssit.examportal.repository;

import com.ssit.examportal.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findBySubjectId(Long subjectId);
    List<Exam> findBySubjectIdIn(List<Long> subjectIds);
    boolean existsBySubjectId(Long subjectId);
}
