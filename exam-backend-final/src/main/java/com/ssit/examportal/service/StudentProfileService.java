package com.ssit.examportal.service;

import com.ssit.examportal.dto.StudentProfileView;
import com.ssit.examportal.dto.UpdateProfileRequest;
import com.ssit.examportal.entity.Student;
import com.ssit.examportal.entity.User;
import com.ssit.examportal.exception.ApiException;
import com.ssit.examportal.repository.StudentRepository;
import com.ssit.examportal.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentProfileService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public StudentProfileService(UserRepository userRepository, StudentRepository studentRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public StudentProfileView getProfile(String username) {
        Student student = resolveStudent(username);
        return toView(username, student);
    }

    @Transactional
    public StudentProfileView updateProfile(String username, UpdateProfileRequest request) {
        Student student = resolveStudent(username);
        student.setEmail(request.getEmail());
        student.setMobile(request.getMobile());
        studentRepository.save(student);
        return toView(username, student);
    }

    private Student resolveStudent(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("Account not found.", HttpStatus.NOT_FOUND));
        if (user.getStudent() == null) {
            throw new ApiException("This account isn't linked to a student record.", HttpStatus.FORBIDDEN);
        }
        return user.getStudent();
    }

    private StudentProfileView toView(String username, Student student) {
        return StudentProfileView.builder()
                .username(username)
                .regNo(student.getRegNo())
                .name(student.getName())
                .courseName(student.getCourse().getCourseName())
                .semester(student.getSemester())
                .email(student.getEmail())
                .mobile(student.getMobile())
                .photoUrl(student.getPhotoUrl())
                .build();
    }
}
