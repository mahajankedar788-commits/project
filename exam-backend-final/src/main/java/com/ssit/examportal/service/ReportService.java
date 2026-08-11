package com.ssit.examportal.service;

import com.ssit.examportal.dto.CourseReportRow;
import com.ssit.examportal.dto.StudentReportRow;
import com.ssit.examportal.dto.SubjectReportRow;
import com.ssit.examportal.entity.AttemptStatus;
import com.ssit.examportal.repository.ExamAttemptRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Backs the admin Reports page. All three reports are aggregated over graded
 * attempts only (SUBMITTED or AUTO_SUBMITTED, with a score recorded) —
 * IN_PROGRESS attempts aren't scored yet so they're excluded rather than
 * counted as a zero.
 */
@Service
public class ReportService {

    private static final List<AttemptStatus> GRADED_STATUSES =
            List.of(AttemptStatus.SUBMITTED, AttemptStatus.AUTO_SUBMITTED);

    private final ExamAttemptRepository examAttemptRepository;

    public ReportService(ExamAttemptRepository examAttemptRepository) {
        this.examAttemptRepository = examAttemptRepository;
    }

    @Transactional(readOnly = true)
    public List<SubjectReportRow> subjectReport() {
        List<SubjectReportRow> rows = examAttemptRepository.subjectReport(GRADED_STATUSES);
        rows.forEach(r -> r.setAveragePercentage(round1(r.getAveragePercentage())));
        return rows;
    }

    @Transactional(readOnly = true)
    public List<CourseReportRow> courseReport() {
        List<CourseReportRow> rows = examAttemptRepository.courseReport(GRADED_STATUSES);
        rows.forEach(r -> r.setAveragePercentage(round1(r.getAveragePercentage())));
        return rows;
    }

    @Transactional(readOnly = true)
    public List<StudentReportRow> studentReport() {
        List<StudentReportRow> rows = examAttemptRepository.studentReport(GRADED_STATUSES);
        rows.forEach(r -> r.setAveragePercentage(round1(r.getAveragePercentage())));
        return rows;
    }

    private static Double round1(Double value) {
        if (value == null) return null;
        return Math.round(value * 10.0) / 10.0;
    }
}
