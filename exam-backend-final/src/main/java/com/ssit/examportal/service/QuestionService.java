package com.ssit.examportal.service;

import com.ssit.examportal.dto.QuestionAdminView;
import com.ssit.examportal.dto.QuestionRequest;
import com.ssit.examportal.entity.Question;
import com.ssit.examportal.entity.Subject;
import com.ssit.examportal.exception.ApiException;
import com.ssit.examportal.repository.QuestionRepository;
import com.ssit.examportal.repository.SubjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;

    public QuestionService(QuestionRepository questionRepository, SubjectRepository subjectRepository) {
        this.questionRepository = questionRepository;
        this.subjectRepository = subjectRepository;
    }

    @Transactional
    public QuestionAdminView add(QuestionRequest request) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ApiException("Selected subject was not found.", HttpStatus.BAD_REQUEST));

        Question question = Question.builder()
                .subject(subject)
                .questionText(request.getQuestionText())
                .optionA(request.getOptionA())
                .optionB(request.getOptionB())
                .optionC(request.getOptionC())
                .optionD(request.getOptionD())
                .correctOption(request.getCorrectOption())
                .marks(request.getMarks())
                .build();

        return QuestionAdminView.from(questionRepository.save(question));
    }

    @Transactional
    public QuestionAdminView update(Long questionId, QuestionRequest request) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ApiException("Question not found.", HttpStatus.NOT_FOUND));

        if (!question.getSubject().getId().equals(request.getSubjectId())) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ApiException("Selected subject was not found.", HttpStatus.BAD_REQUEST));
            question.setSubject(subject);
        }

        question.setQuestionText(request.getQuestionText());
        question.setOptionA(request.getOptionA());
        question.setOptionB(request.getOptionB());
        question.setOptionC(request.getOptionC());
        question.setOptionD(request.getOptionD());
        question.setCorrectOption(request.getCorrectOption());
        question.setMarks(request.getMarks());

        return QuestionAdminView.from(questionRepository.save(question));
    }

    @Transactional
    public void delete(Long questionId) {
        if (!questionRepository.existsById(questionId)) {
            throw new ApiException("Question not found.", HttpStatus.NOT_FOUND);
        }
        questionRepository.deleteById(questionId);
    }

    @Transactional(readOnly = true)
    public List<QuestionAdminView> listBySubject(Long subjectId) {
        return questionRepository.findBySubjectId(subjectId).stream()
                .map(QuestionAdminView::from)
                .toList();
    }
}
