package com.ssit.examportal.controller;

import com.ssit.examportal.dto.ApiResponse;
import com.ssit.examportal.entity.Course;
import com.ssit.examportal.exception.ApiException;
import com.ssit.examportal.repository.CourseRepository;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/courses")
public class AdminCourseController {

    private final CourseRepository courseRepository;

    public AdminCourseController(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public record CourseRequest(@NotBlank(message = "Course name is required") String courseName) {}

    @PostMapping
    public ApiResponse<Course> add(@RequestBody CourseRequest request) {
        if (courseRepository.findByCourseNameIgnoreCase(request.courseName()).isPresent()) {
            throw new ApiException("This course already exists.", HttpStatus.CONFLICT);
        }
        Course course = Course.builder().courseName(request.courseName()).build();
        return ApiResponse.ok("Course added.", courseRepository.save(course));
    }

    @GetMapping
    public ApiResponse<List<Course>> list() {
        return ApiResponse.ok(null, courseRepository.findAll());
    }
}
