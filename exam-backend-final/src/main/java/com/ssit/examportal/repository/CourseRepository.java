package com.ssit.examportal.repository;

import com.ssit.examportal.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCourseNameIgnoreCase(String courseName);
}
