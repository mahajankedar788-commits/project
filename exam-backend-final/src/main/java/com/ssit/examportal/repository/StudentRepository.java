package com.ssit.examportal.repository;

import com.ssit.examportal.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRegNo(String regNo);
    boolean existsByRegNo(String regNo);
    List<Student> findByCourseIdAndSemester(Long courseId, Integer semester);
}
