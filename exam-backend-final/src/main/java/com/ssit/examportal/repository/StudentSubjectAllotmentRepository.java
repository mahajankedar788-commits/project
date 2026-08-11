package com.ssit.examportal.repository;

import com.ssit.examportal.entity.StudentSubjectAllotment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentSubjectAllotmentRepository extends JpaRepository<StudentSubjectAllotment, Long> {
    List<StudentSubjectAllotment> findByStudentId(Long studentId);
    boolean existsByStudentIdAndSubjectId(Long studentId, Long subjectId);
}
