package com.ssit.examportal.service;

import com.ssit.examportal.dto.AllotmentRequest;
import com.ssit.examportal.dto.AllotmentView;
import com.ssit.examportal.entity.Student;
import com.ssit.examportal.entity.StudentSubjectAllotment;
import com.ssit.examportal.entity.Subject;
import com.ssit.examportal.exception.ApiException;
import com.ssit.examportal.repository.StudentRepository;
import com.ssit.examportal.repository.StudentSubjectAllotmentRepository;
import com.ssit.examportal.repository.SubjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AllotmentService {

    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final StudentSubjectAllotmentRepository allotmentRepository;

    public AllotmentService(
            StudentRepository studentRepository,
            SubjectRepository subjectRepository,
            StudentSubjectAllotmentRepository allotmentRepository
    ) {
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.allotmentRepository = allotmentRepository;
    }

    @Transactional
    public List<AllotmentView> allot(AllotmentRequest request) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ApiException("Selected subject was not found.", HttpStatus.BAD_REQUEST));

        List<Student> targets;

        if (request.getStudentId() != null) {
            // Single-student override.
            Student student = studentRepository.findById(request.getStudentId())
                    .orElseThrow(() -> new ApiException("Selected student was not found.", HttpStatus.BAD_REQUEST));
            targets = List.of(student);
        } else if (request.getCourseId() != null && request.getSemester() != null) {
            // Bulk allotment: every student in that course + semester.
            targets = studentRepository.findByCourseIdAndSemester(request.getCourseId(), request.getSemester());
        } else {
            throw new ApiException(
                    "Provide either a studentId, or a courseId + semester for bulk allotment.",
                    HttpStatus.BAD_REQUEST
            );
        }

        return targets.stream()
                .filter(student -> !allotmentRepository.existsByStudentIdAndSubjectId(student.getId(), subject.getId()))
                .map(student -> allotmentRepository.save(
                        StudentSubjectAllotment.builder().student(student).subject(subject).build()
                ))
                .map(AllotmentView::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AllotmentView> listForStudent(Long studentId) {
        return allotmentRepository.findByStudentId(studentId).stream()
                .map(AllotmentView::from)
                .toList();
    }
}
