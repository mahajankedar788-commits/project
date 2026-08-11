package com.ssit.examportal.dto;

import com.ssit.examportal.entity.StudentSubjectAllotment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllotmentView {
    private Long id;
    private Long studentId;
    private String studentRegNo;
    private String studentName;
    private Long subjectId;
    private String subjectName;

    /** Must be called while the entity's Hibernate session is still open (i.e. inside a @Transactional method). */
    public static AllotmentView from(StudentSubjectAllotment a) {
        return AllotmentView.builder()
                .id(a.getId())
                .studentId(a.getStudent().getId())
                .studentRegNo(a.getStudent().getRegNo())
                .studentName(a.getStudent().getName())
                .subjectId(a.getSubject().getId())
                .subjectName(a.getSubject().getSubjectName())
                .build();
    }
}
