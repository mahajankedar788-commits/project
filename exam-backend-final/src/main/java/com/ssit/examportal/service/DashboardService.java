package com.ssit.examportal.service;

import com.ssit.examportal.dto.DashboardStatsView;
import com.ssit.examportal.entity.AttemptStatus;
import com.ssit.examportal.repository.ExamAttemptRepository;
import com.ssit.examportal.repository.ExamRepository;
import com.ssit.examportal.repository.StudentRepository;
import com.ssit.examportal.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DashboardService {

    private static final List<AttemptStatus> GRADED_STATUSES =
            List.of(AttemptStatus.SUBMITTED, AttemptStatus.AUTO_SUBMITTED);

    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final ExamRepository examRepository;
    private final ExamAttemptRepository examAttemptRepository;

    public DashboardService(
            StudentRepository studentRepository,
            SubjectRepository subjectRepository,
            ExamRepository examRepository,
            ExamAttemptRepository examAttemptRepository
    ) {
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.examRepository = examRepository;
        this.examAttemptRepository = examAttemptRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsView getStats() {
        long gradedAttempts = examAttemptRepository.countGraded(GRADED_STATUSES);
        long passedAttempts = gradedAttempts == 0 ? 0 : examAttemptRepository.countPassed(GRADED_STATUSES);

        Double passRate = gradedAttempts == 0
                ? null
                : Math.round((passedAttempts * 1000.0 / gradedAttempts)) / 10.0;

        return DashboardStatsView.builder()
                .registeredStudents(studentRepository.count())
                .activeSubjects(subjectRepository.count())
                .examsScheduled(examRepository.count())
                .gradedAttempts(gradedAttempts)
                .overallPassRate(passRate)
                .build();
    }
}
