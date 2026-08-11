package com.ssit.examportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfileView {
    private String username;
    private String regNo;
    private String name;
    private String courseName;
    private Integer semester;
    private String email;
    private String mobile;
    private String photoUrl;
}
