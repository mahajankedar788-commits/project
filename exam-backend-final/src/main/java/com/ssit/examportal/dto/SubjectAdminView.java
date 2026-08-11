package com.ssit.examportal.dto;

import com.ssit.examportal.entity.Subject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectAdminView {
    private Long id;
    private String subjectCode;
    private String subjectName;
    private Long courseId;
    private String courseName;
    private Integer semester;
    private Integer totalMarks;
    private Integer passingMarks;
    private Integer durationMinutes;

    /** Must be called while the entity's Hibernate session is still open (i.e. inside a @Transactional method). */
    public static SubjectAdminView from(Subject s) {
        return SubjectAdminView.builder()
                .id(s.getId())
                .subjectCode(s.getSubjectCode())
                .subjectName(s.getSubjectName())
                .courseId(s.getCourse().getId())
                .courseName(s.getCourse().getCourseName())
                .semester(s.getSemester())
                .totalMarks(s.getTotalMarks())
                .passingMarks(s.getPassingMarks())
                .durationMinutes(s.getDurationMinutes())
                .build();
    }
}
