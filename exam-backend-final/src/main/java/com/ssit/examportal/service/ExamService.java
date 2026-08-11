package com.ssit.examportal.service;

import com.ssit.examportal.dto.AnswerRequest;
import com.ssit.examportal.dto.ExamAdminView;
import com.ssit.examportal.dto.ExamAttemptView;
import com.ssit.examportal.dto.ExamRequest;
import com.ssit.examportal.dto.ExamResultView;
import com.ssit.examportal.dto.QuestionForAttemptView;
import com.ssit.examportal.dto.StudentExamListItem;
import com.ssit.examportal.dto.StudentResultListItem;
import com.ssit.examportal.entity.AttemptStatus;
import com.ssit.examportal.entity.Exam;
import com.ssit.examportal.entity.ExamAnswer;
import com.ssit.examportal.entity.ExamAttempt;
import com.ssit.examportal.entity.Question;
import com.ssit.examportal.entity.Student;
import com.ssit.examportal.entity.Subject;
import com.ssit.examportal.entity.User;
import com.ssit.examportal.exception.ApiException;
import com.ssit.examportal.repository.ExamAnswerRepository;
import com.ssit.examportal.repository.ExamAttemptRepository;
import com.ssit.examportal.repository.ExamRepository;
import com.ssit.examportal.repository.QuestionRepository;
import com.ssit.examportal.repository.StudentSubjectAllotmentRepository;
import com.ssit.examportal.repository.SubjectRepository;
import com.ssit.examportal.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;
    private final QuestionRepository questionRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final ExamAnswerRepository examAnswerRepository;
    private final StudentSubjectAllotmentRepository allotmentRepository;
    private final UserRepository userRepository;

    public ExamService(
            ExamRepository examRepository,
            SubjectRepository subjectRepository,
            QuestionRepository questionRepository,
            ExamAttemptRepository examAttemptRepository,
            ExamAnswerRepository examAnswerRepository,
            StudentSubjectAllotmentRepository allotmentRepository,
            UserRepository userRepository
    ) {
        this.examRepository = examRepository;
        this.subjectRepository = subjectRepository;
        this.questionRepository = questionRepository;
        this.examAttemptRepository = examAttemptRepository;
        this.examAnswerRepository = examAnswerRepository;
        this.allotmentRepository = allotmentRepository;
        this.userRepository = userRepository;
    }

    // ------------------------------------------------------------------
    // Admin: scheduling
    // ------------------------------------------------------------------

    @Transactional
    public ExamAdminView schedule(ExamRequest request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new ApiException("End time must be after start time.", HttpStatus.BAD_REQUEST);
        }

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ApiException("Selected subject was not found.", HttpStatus.BAD_REQUEST));

        long available = questionRepository.countBySubjectId(subject.getId());
        if (available < request.getTotalQuestions()) {
            throw new ApiException(
                    "This subject's question bank only has " + available +
                    " question(s) — need at least " + request.getTotalQuestions() + " to schedule this exam.",
                    HttpStatus.BAD_REQUEST
            );
        }

        Exam exam = Exam.builder()
                .examName(request.getExamName())
                .subject(subject)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .durationMinutes(request.getDurationMinutes())
                .totalQuestions(request.getTotalQuestions())
                .build();

        return ExamAdminView.from(examRepository.save(exam));
    }

    @Transactional(readOnly = true)
    public List<ExamAdminView> listAll() {
        return examRepository.findAll().stream().map(ExamAdminView::from).toList();
    }

    /** Rejects the delete once any student has an attempt on record, so attempt/answer history is never silently orphaned. */
    @Transactional
    public void delete(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ApiException("Exam not found.", HttpStatus.NOT_FOUND));

        if (!examAttemptRepository.findByExamId(examId).isEmpty()) {
            throw new ApiException(
                    "This exam already has student attempts on record and can't be deleted.",
                    HttpStatus.CONFLICT
            );
        }

        examRepository.delete(exam);
    }

    // ------------------------------------------------------------------
    // Student: browsing + taking exams
    // ------------------------------------------------------------------

    @Transactional
    public List<StudentExamListItem> listForStudent(String username) {
        Student student = resolveStudent(username);

        List<Long> subjectIds = allotmentRepository.findByStudentId(student.getId()).stream()
                .map(a -> a.getSubject().getId())
                .toList();
        if (subjectIds.isEmpty()) {
            return List.of();
        }

        List<Exam> exams = examRepository.findBySubjectIdIn(subjectIds);

        Map<Long, ExamAttempt> attemptsByExamId = examAttemptRepository.findByStudentId(student.getId()).stream()
                .collect(Collectors.toMap(a -> a.getExam().getId(), a -> a));

        Instant now = Instant.now();

        return exams.stream()
                .map(exam -> {
                    ExamAttempt attempt = attemptsByExamId.get(exam.getId());

                    // An attempt that ran out the clock without the student submitting —
                    // grade it now rather than leaving it stuck as IN_PROGRESS.
                    if (attempt != null && attempt.getStatus() == AttemptStatus.IN_PROGRESS
                            && attempt.getExpiresAt().isBefore(now)) {
                        gradeAndClose(attempt, AttemptStatus.AUTO_SUBMITTED);
                    }

                    return StudentExamListItem.builder()
                            .examId(exam.getId())
                            .subjectName(exam.getSubject().getSubjectName())
                            .startTime(exam.getStartTime())
                            .endTime(exam.getEndTime())
                            .durationMinutes(exam.getDurationMinutes())
                            .attemptStatus(attempt == null ? "NOT_STARTED" : attempt.getStatus().name())
                            .score(attempt == null ? null : attempt.getTotalScore())
                            .build();
                })
                .sorted(Comparator.comparing(StudentExamListItem::getStartTime))
                .toList();
    }

    /** Starts a new attempt, or returns the in-progress one if the student already started (e.g. on refresh). */
    @Transactional
    public ExamAttemptView startOrResume(String username, Long examId) {
        Student student = resolveStudent(username);
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ApiException("Exam not found.", HttpStatus.NOT_FOUND));

        if (!allotmentRepository.existsByStudentIdAndSubjectId(student.getId(), exam.getSubject().getId())) {
            throw new ApiException("You aren't allotted this subject.", HttpStatus.FORBIDDEN);
        }

        Instant now = Instant.now();

        Optional<ExamAttempt> existing = examAttemptRepository.findByStudentIdAndExamId(student.getId(), examId);
        if (existing.isPresent()) {
            ExamAttempt attempt = existing.get();
            if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
                throw new ApiException("You've already submitted this exam.", HttpStatus.CONFLICT);
            }
            if (attempt.getExpiresAt().isBefore(now)) {
                gradeAndClose(attempt, AttemptStatus.AUTO_SUBMITTED);
                throw new ApiException("Your time for this exam has already expired.", HttpStatus.CONFLICT);
            }
            return buildAttemptView(attempt);
        }

        if (now.isBefore(exam.getStartTime())) {
            throw new ApiException("This exam hasn't opened yet.", HttpStatus.BAD_REQUEST);
        }
        if (now.isAfter(exam.getEndTime())) {
            throw new ApiException("This exam's window has closed.", HttpStatus.BAD_REQUEST);
        }

        List<Question> pool = new ArrayList<>(questionRepository.findBySubjectId(exam.getSubject().getId()));
        if (pool.size() < exam.getTotalQuestions()) {
            throw new ApiException(
                    "This exam's question bank is incomplete. Contact your administrator.",
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        Collections.shuffle(pool);
        List<Question> drawn = pool.subList(0, exam.getTotalQuestions());

        // Per-student timer, capped so it can't outlast the exam's overall window.
        Instant expiresAt = now.plus(Duration.ofMinutes(exam.getDurationMinutes()));
        if (expiresAt.isAfter(exam.getEndTime())) {
            expiresAt = exam.getEndTime();
        }

        ExamAttempt attempt = ExamAttempt.builder()
                .student(student)
                .exam(exam)
                .startedAt(now)
                .expiresAt(expiresAt)
                .status(AttemptStatus.IN_PROGRESS)
                .build();
        attempt = examAttemptRepository.save(attempt);

        for (Question question : drawn) {
            examAnswerRepository.save(ExamAnswer.builder().attempt(attempt).question(question).build());
        }

        return buildAttemptView(attempt);
    }

    @Transactional
    public void saveAnswer(String username, Long attemptId, AnswerRequest request) {
        ExamAttempt attempt = requireOwnInProgressAttempt(username, attemptId);

        ExamAnswer answer = examAnswerRepository.findByAttemptIdAndQuestionId(attemptId, request.getQuestionId())
                .orElseThrow(() -> new ApiException("This question isn't part of this attempt.", HttpStatus.BAD_REQUEST));

        answer.setSelectedOption(request.getSelectedOption());
        examAnswerRepository.save(answer);
    }

    @Transactional
    public ExamResultView submit(String username, Long attemptId) {
        ExamAttempt attempt = requireOwnInProgressAttempt(username, attemptId);
        return gradeAndClose(attempt, AttemptStatus.SUBMITTED);
    }

    /** Summary list behind GET /student/results — one row per graded attempt, most recent first. */
    @Transactional(readOnly = true)
    public List<StudentResultListItem> listResultsForStudent(String username) {
        Student student = resolveStudent(username);

        return examAttemptRepository.findByStudentId(student.getId()).stream()
                .filter(a -> a.getStatus() == AttemptStatus.SUBMITTED || a.getStatus() == AttemptStatus.AUTO_SUBMITTED)
                .sorted(Comparator.comparing(ExamAttempt::getSubmittedAt).reversed())
                .map(attempt -> {
                    Subject subject = attempt.getExam().getSubject();
                    return StudentResultListItem.builder()
                            .attemptId(attempt.getId())
                            .examName(attempt.getExam().getExamName())
                            .subjectName(subject.getSubjectName())
                            .totalScore(attempt.getTotalScore())
                            .maxMarks(subject.getTotalMarks())
                            .passingMarks(subject.getPassingMarks())
                            .passed(attempt.getTotalScore() != null && attempt.getTotalScore() >= subject.getPassingMarks())
                            .submittedAt(attempt.getSubmittedAt())
                            .build();
                })
                .toList();
    }

    /** Full answer-by-answer breakdown behind GET /student/results/{attemptId} — read-only, doesn't re-grade. */
    @Transactional(readOnly = true)
    public ExamResultView getResultDetail(String username, Long attemptId) {
        Student student = resolveStudent(username);
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ApiException("Result not found.", HttpStatus.NOT_FOUND));

        if (!attempt.getStudent().getId().equals(student.getId())) {
            throw new ApiException("You don't have permission to do that.", HttpStatus.FORBIDDEN);
        }
        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
            throw new ApiException("This exam hasn't been submitted yet.", HttpStatus.BAD_REQUEST);
        }

        List<ExamAnswer> answers = examAnswerRepository.findByAttemptId(attempt.getId());
        List<ExamResultView.AnswerBreakdown> breakdown = answers.stream()
                .map(answer -> {
                    Question question = answer.getQuestion();
                    return ExamResultView.AnswerBreakdown.builder()
                            .questionId(question.getId())
                            .questionText(question.getQuestionText())
                            .selectedOption(answer.getSelectedOption() == null ? null : answer.getSelectedOption().name())
                            .correctOption(question.getCorrectOption().name())
                            .correct(Boolean.TRUE.equals(answer.getIsCorrect()))
                            .marks(question.getMarks())
                            .build();
                })
                .toList();

        Subject subject = attempt.getExam().getSubject();
        return ExamResultView.builder()
                .attemptId(attempt.getId())
                .examName(attempt.getExam().getExamName())
                .subjectName(subject.getSubjectName())
                .totalScore(attempt.getTotalScore())
                .maxMarks(subject.getTotalMarks())
                .passingMarks(subject.getPassingMarks())
                .passed(attempt.getTotalScore() != null && attempt.getTotalScore() >= subject.getPassingMarks())
                .submittedAt(attempt.getSubmittedAt())
                .breakdown(breakdown)
                .build();
    }

    /**
     * Grades and closes out any attempt whose timer ran out without the student submitting.
     * Called on a fixed schedule by {@code AttemptExpirySweeper} — the same auto-submit path
     * also runs inline in {@link #listForStudent} and {@link #startOrResume} so a student
     * never sees a stale IN_PROGRESS attempt, but this sweep catches attempts for students
     * who never come back to the app at all.
     */
    @Transactional
    public void autoSubmitExpired() {
        List<ExamAttempt> overdue = examAttemptRepository.findByStatusAndExpiresAtBefore(
                AttemptStatus.IN_PROGRESS, Instant.now()
        );
        for (ExamAttempt attempt : overdue) {
            gradeAndClose(attempt, AttemptStatus.AUTO_SUBMITTED);
        }
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private Student resolveStudent(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ApiException("Account not found.", HttpStatus.NOT_FOUND));
        if (user.getStudent() == null) {
            throw new ApiException("This account isn't linked to a student record.", HttpStatus.FORBIDDEN);
        }
        return user.getStudent();
    }

    private ExamAttempt requireOwnInProgressAttempt(String username, Long attemptId) {
        Student student = resolveStudent(username);
        ExamAttempt attempt = examAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ApiException("Attempt not found.", HttpStatus.NOT_FOUND));

        if (!attempt.getStudent().getId().equals(student.getId())) {
            throw new ApiException("You don't have permission to do that.", HttpStatus.FORBIDDEN);
        }
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new ApiException("This exam has already been submitted.", HttpStatus.CONFLICT);
        }
        if (attempt.getExpiresAt().isBefore(Instant.now())) {
            gradeAndClose(attempt, AttemptStatus.AUTO_SUBMITTED);
            throw new ApiException("Time's up — this exam was auto-submitted.", HttpStatus.CONFLICT);
        }
        return attempt;
    }

    private ExamAttemptView buildAttemptView(ExamAttempt attempt) {
        List<QuestionForAttemptView> questions = examAnswerRepository.findByAttemptId(attempt.getId()).stream()
                .map(a -> QuestionForAttemptView.from(a.getQuestion(), a.getSelectedOption()))
                .toList();

        return ExamAttemptView.builder()
                .attemptId(attempt.getId())
                .examId(attempt.getExam().getId())
                .subjectName(attempt.getExam().getSubject().getSubjectName())
                .expiresAt(attempt.getExpiresAt())
                .questions(questions)
                .build();
    }

    /** Scores every answer, closes out the attempt, and returns the result. Used by both manual and auto-submit. */
    private ExamResultView gradeAndClose(ExamAttempt attempt, AttemptStatus finalStatus) {
        List<ExamAnswer> answers = examAnswerRepository.findByAttemptId(attempt.getId());

        int totalScore = 0;
        List<ExamResultView.AnswerBreakdown> breakdown = new ArrayList<>();
        for (ExamAnswer answer : answers) {
            Question question = answer.getQuestion();
            boolean correct = answer.getSelectedOption() != null && answer.getSelectedOption() == question.getCorrectOption();
            answer.setIsCorrect(correct);
            if (correct) {
                totalScore += question.getMarks();
            }
            breakdown.add(ExamResultView.AnswerBreakdown.builder()
                    .questionId(question.getId())
                    .questionText(question.getQuestionText())
                    .selectedOption(answer.getSelectedOption() == null ? null : answer.getSelectedOption().name())
                    .correctOption(question.getCorrectOption().name())
                    .correct(correct)
                    .marks(question.getMarks())
                    .build());
        }
        examAnswerRepository.saveAll(answers);

        attempt.setStatus(finalStatus);
        attempt.setSubmittedAt(Instant.now());
        attempt.setTotalScore(totalScore);
        examAttemptRepository.save(attempt);

        Subject subject = attempt.getExam().getSubject();
        return ExamResultView.builder()
                .attemptId(attempt.getId())
                .examName(attempt.getExam().getExamName())
                .subjectName(subject.getSubjectName())
                .totalScore(totalScore)
                .maxMarks(subject.getTotalMarks())
                .passingMarks(subject.getPassingMarks())
                .passed(totalScore >= subject.getPassingMarks())
                .submittedAt(attempt.getSubmittedAt())
                .breakdown(breakdown)
                .build();
    }
}
