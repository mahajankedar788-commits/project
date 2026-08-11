package com.ssit.examportal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminPasswordResetResponse {
    private Long studentId;
    private String regNo;
    private String name;
    private String username;

    /**
     * Returned exactly once, at reset time, so the admin can hand it to the
     * student. It is never persisted or retrievable again — only its BCrypt
     * hash is stored. There is no way to view a student's existing password;
     * resetting is the only supported recovery path.
     */
    private String generatedPassword;
}
