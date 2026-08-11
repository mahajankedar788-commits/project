package com.ssit.examportal.repository;

import com.ssit.examportal.entity.AttemptStatus;
import com.ssit.examportal.entity.ExamAttempt;
import com.ssit.examportal.dto.CourseReportRow;
import com.ssit.examportal.dto.StudentReportRow;
import com.ssit.examportal.dto.SubjectReportRow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    Optional<ExamAttempt> findByStudentIdAndExamId(Long studentId, Long examId);
    List<ExamAttempt> findByStudentId(Long studentId);
    boolean existsByStudentId(Long studentId);
    List<ExamAttempt> findByExamId(Long examId);
    List<ExamAttempt> findByStatusAndExpiresAtBefore(AttemptStatus status, Instant cutoff);

    /** Attempts that have been graded (submitted, with a score recorded) — the population the pass rate is computed over. */
    @Query("SELECT COUNT(a) FROM ExamAttempt a WHERE a.status IN :statuses AND a.totalScore IS NOT NULL")
    long countGraded(@Param("statuses") Collection<AttemptStatus> statuses);

    /** Of those graded attempts, how many met their subject's passing marks. */
    @Query("SELECT COUNT(a) FROM ExamAttempt a WHERE a.status IN :statuses AND a.totalScore IS NOT NULL " +
           "AND a.totalScore >= a.exam.subject.passingMarks")
    long countPassed(@Param("statuses") Collection<AttemptStatus> statuses);

    /** Subject-wise performance report: one aggregated row per subject, over graded attempts only. */
    @Query("SELECT new com.ssit.examportal.dto.SubjectReportRow(" +
           "s.id, s.subjectCode, s.subjectName, s.course.courseName, " +
           "COUNT(a), AVG(CAST(a.totalScore AS double) / s.totalMarks * 100.0), " +
           "SUM(CASE WHEN a.totalScore >= s.passingMarks THEN 1L ELSE 0L END)) " +
           "FROM ExamAttempt a JOIN a.exam e JOIN e.subject s " +
           "WHERE a.status IN :statuses AND a.totalScore IS NOT NULL " +
           "GROUP BY s.id, s.subjectCode, s.subjectName, s.course.courseName " +
           "ORDER BY s.subjectName")
    List<SubjectReportRow> subjectReport(@Param("statuses") Collection<AttemptStatus> statuses);

    /** Course-wise performance report: one aggregated row per course, over graded attempts only. */
    @Query("SELECT new com.ssit.examportal.dto.CourseReportRow(" +
           "c.id, c.courseName, " +
           "COUNT(a), AVG(CAST(a.totalScore AS double) / s.totalMarks * 100.0), " +
           "SUM(CASE WHEN a.totalScore >= s.passingMarks THEN 1L ELSE 0L END)) " +
           "FROM ExamAttempt a JOIN a.exam e JOIN e.subject s JOIN s.course c " +
           "WHERE a.status IN :statuses AND a.totalScore IS NOT NULL " +
           "GROUP BY c.id, c.courseName " +
           "ORDER BY c.courseName")
    List<CourseReportRow> courseReport(@Param("statuses") Collection<AttemptStatus> statuses);

    /** Student-wise performance report: one aggregated row per student, over that student's own graded attempts. */
    @Query("SELECT new com.ssit.examportal.dto.StudentReportRow(" +
           "st.id, st.regNo, st.name, st.course.courseName, " +
           "COUNT(a), AVG(CAST(a.totalScore AS double) / s.totalMarks * 100.0), " +
           "SUM(CASE WHEN a.totalScore >= s.passingMarks THEN 1L ELSE 0L END)) " +
           "FROM ExamAttempt a JOIN a.exam e JOIN e.subject s JOIN a.student st " +
           "WHERE a.status IN :statuses AND a.totalScore IS NOT NULL " +
           "GROUP BY st.id, st.regNo, st.name, st.course.courseName " +
           "ORDER BY st.name")
    List<StudentReportRow> studentReport(@Param("statuses") Collection<AttemptStatus> statuses);
}
