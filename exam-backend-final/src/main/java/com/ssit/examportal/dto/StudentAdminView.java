package com.ssit.examportal.dto;

import com.ssit.examportal.entity.Student;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAdminView {
    private Long id;
    private String regNo;
    private String name;
    private Long courseId;
    private String courseName;
    private Integer semester;
    private String email;
    private String mobile;
    private String photoUrl;

    /** Must be called while the entity's Hibernate session is still open (i.e. inside a @Transactional method). */
    public static StudentAdminView from(Student s) {
        return StudentAdminView.builder()
                .id(s.getId())
                .regNo(s.getRegNo())
                .name(s.getName())
                .courseId(s.getCourse().getId())
                .courseName(s.getCourse().getCourseName())
                .semester(s.getSemester())
                .email(s.getEmail())
                .mobile(s.getMobile())
                .photoUrl(s.getPhotoUrl())
                .build();
    }
}
