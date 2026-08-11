package com.ssit.examportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentRegistrationResponse {
    private Long studentId;
    private String regNo;
    private String name;
    private String generatedUsername;

    /**
     * Returned exactly once, at creation time, so the admin can hand it to
     * the student. It is never persisted or retrievable again — only its
     * BCrypt hash is stored.
     */
    private String generatedPassword;
}
