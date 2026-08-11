package com.ssit.examportal.service;

import com.ssit.examportal.dto.AdminPasswordResetResponse;
import com.ssit.examportal.dto.StudentAdminView;
import com.ssit.examportal.dto.StudentRegistrationRequest;
import com.ssit.examportal.dto.StudentRegistrationResponse;
import com.ssit.examportal.entity.Course;
import com.ssit.examportal.entity.Role;
import com.ssit.examportal.entity.Student;
import com.ssit.examportal.entity.User;
import com.ssit.examportal.exception.ApiException;
import com.ssit.examportal.repository.CourseRepository;
import com.ssit.examportal.repository.ExamAttemptRepository;
import com.ssit.examportal.repository.StudentRepository;
import com.ssit.examportal.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordGenerator passwordGenerator;

    public StudentService(
            StudentRepository studentRepository,
            CourseRepository courseRepository,
            UserRepository userRepository,
            ExamAttemptRepository examAttemptRepository,
            PasswordEncoder passwordEncoder,
            PasswordGenerator passwordGenerator
    ) {
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.examAttemptRepository = examAttemptRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordGenerator = passwordGenerator;
    }

    @Transactional
    public StudentRegistrationResponse registerStudent(StudentRegistrationRequest request) {
        if (studentRepository.existsByRegNo(request.getRegNo())) {
            throw new ApiException(
                    "A student with registration number " + request.getRegNo() + " already exists.",
                    HttpStatus.CONFLICT
            );
        }
        // Username = registration number, so a clash here means the account already exists too.
        if (userRepository.existsByUsername(request.getRegNo())) {
            throw new ApiException(
                    "An account already exists for registration number " + request.getRegNo() + ".",
                    HttpStatus.CONFLICT
            );
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ApiException("Selected course was not found.", HttpStatus.BAD_REQUEST));

        Student student = Student.builder()
                .regNo(request.getRegNo())
                .name(request.getName())
                .course(course)
                .semester(request.getSemester())
                .email(request.getEmail())
                .mobile(request.getMobile())
                .photoUrl(request.getPhotoUrl())
                .build();
        student = studentRepository.save(student);

        // Username = registration number; password is a fresh random secret,
        // never stored in plaintext, and only ever returned in this response.
        String generatedUsername = student.getRegNo();
        String generatedPassword = passwordGenerator.generate();

        User user = User.builder()
                .username(generatedUsername)
                .passwordHash(passwordEncoder.encode(generatedPassword))
                .role(Role.STUDENT)
                .mustChangePassword(true)
                .student(student)
                .build();
        userRepository.save(user);

        return StudentRegistrationResponse.builder()
                .studentId(student.getId())
                .regNo(student.getRegNo())
                .name(student.getName())
                .generatedUsername(generatedUsername)
                .generatedPassword(generatedPassword)
                .build();
    }

    @Transactional(readOnly = true)
    public List<StudentAdminView> listAll() {
        return studentRepository.findAll().stream().map(StudentAdminView::from).toList();
    }

    @Transactional(readOnly = true)
    public List<StudentAdminView> listByCourseAndSemester(Long courseId, Integer semester) {
        return studentRepository.findByCourseIdAndSemester(courseId, semester).stream()
                .map(StudentAdminView::from)
                .toList();
    }

    /**
     * Removes a student's registration and login account. Blocked if the
     * student has any exam attempts on record, so academic history is never
     * silently destroyed — those need to be handled deliberately first.
     */
    @Transactional
    public void deleteStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ApiException("Student not found.", HttpStatus.NOT_FOUND));

        if (examAttemptRepository.existsByStudentId(studentId)) {
            throw new ApiException(
                    "Can't remove " + student.getName() + " — they have exam attempts on record. " +
                            "Removing a student would also erase that history.",
                    HttpStatus.CONFLICT
            );
        }

        // The login account references the student row, so it must go first.
        userRepository.findByUsername(student.getRegNo()).ifPresent(userRepository::delete);
        studentRepository.delete(student);
    }

    /**
     * Issues a fresh random password for a student's account. This is the
     * only supported way to recover access — the current password is never
     * stored in a recoverable form, so it can't be viewed, only replaced.
     */
    @Transactional
    public AdminPasswordResetResponse resetPassword(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ApiException("Student not found.", HttpStatus.NOT_FOUND));

        User user = userRepository.findByUsername(student.getRegNo())
                .orElseThrow(() -> new ApiException("This student has no login account.", HttpStatus.NOT_FOUND));

        String generatedPassword = passwordGenerator.generate();
        user.setPasswordHash(passwordEncoder.encode(generatedPassword));
        user.setMustChangePassword(true);
        userRepository.save(user);

        return AdminPasswordResetResponse.builder()
                .studentId(student.getId())
                .regNo(student.getRegNo())
                .name(student.getName())
                .username(user.getUsername())
                .generatedPassword(generatedPassword)
                .build();
    }
}
