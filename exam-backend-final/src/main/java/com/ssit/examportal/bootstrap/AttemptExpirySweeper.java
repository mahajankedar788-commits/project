package com.ssit.examportal.bootstrap;

import com.ssit.examportal.service.ExamService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AttemptExpirySweeper {

    private final ExamService examService;

    public AttemptExpirySweeper(ExamService examService) {
        this.examService = examService;
    }

    /** Runs every minute so a submitted score shows up promptly even if the student never reopens the app. */
    @Scheduled(fixedRate = 60_000)
    public void sweep() {
        examService.autoSubmitExpired();
    }
}
