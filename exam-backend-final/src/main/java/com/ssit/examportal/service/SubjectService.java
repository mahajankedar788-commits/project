package com.ssit.examportal.service;

import com.ssit.examportal.dto.SubjectAdminView;
import com.ssit.examportal.dto.SubjectRequest;
import com.ssit.examportal.entity.Course;
import com.ssit.examportal.entity.Subject;
import com.ssit.examportal.exception.ApiException;
import com.ssit.examportal.repository.CourseRepository;
import com.ssit.examportal.repository.ExamRepository;
import com.ssit.examportal.repository.SubjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final CourseRepository courseRepository;
    private final ExamRepository examRepository;

    public SubjectService(
            SubjectRepository subjectRepository,
            CourseRepository courseRepository,
            ExamRepository examRepository
    ) {
        this.subjectRepository = subjectRepository;
        this.courseRepository = courseRepository;
        this.examRepository = examRepository;
    }

    @Transactional
    public SubjectAdminView addSubject(SubjectRequest request) {
        if (subjectRepository.existsBySubjectCode(request.getSubjectCode())) {
            throw new ApiException(
                    "Subject code " + request.getSubjectCode() + " is already in use.",
                    HttpStatus.CONFLICT
            );
        }
        if (request.getPassingMarks() > request.getTotalMarks()) {
            throw new ApiException("Passing marks cannot exceed total marks.", HttpStatus.BAD_REQUEST);
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ApiException("Selected course was not found.", HttpStatus.BAD_REQUEST));

        Subject subject = Subject.builder()
                .subjectCode(request.getSubjectCode())
                .subjectName(request.getSubjectName())
                .course(course)
                .semester(request.getSemester())
                .totalMarks(request.getTotalMarks())
                .passingMarks(request.getPassingMarks())
                .durationMinutes(request.getDurationMinutes())
                .build();

        return SubjectAdminView.from(subjectRepository.save(subject));
    }

    @Transactional(readOnly = true)
    public List<SubjectAdminView> listAll() {
        return subjectRepository.findAll().stream().map(SubjectAdminView::from).toList();
    }

    /**
     * Removes a subject. Blocked if any exam has been scheduled against it,
     * so exam history can't be silently orphaned. Its question bank and any
     * student allotments are removed automatically along with it.
     */
    @Transactional
    public void deleteSubject(Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ApiException("Subject not found.", HttpStatus.NOT_FOUND));

        if (examRepository.existsBySubjectId(subjectId)) {
            throw new ApiException(
                    "Can't remove " + subject.getSubjectName() + " — it has exams scheduled against it. " +
                            "Remove those exams first.",
                    HttpStatus.CONFLICT
            );
        }

        subjectRepository.delete(subject);
    }
}
