package com.ssit.examportal.bootstrap;

import com.ssit.examportal.entity.Role;
import com.ssit.examportal.entity.User;
import com.ssit.examportal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin-username}")
    private String seedUsername;

    @Value("${app.seed.admin-password}")
    private String seedPassword;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.existsByUsername(seedUsername)) {
            return;
        }

        User admin = User.builder()
                .username(seedUsername)
                .passwordHash(passwordEncoder.encode(seedPassword))
                .role(Role.ADMIN)
                .mustChangePassword(true)
                .build();

        userRepository.save(admin);

        log.info(
            "Seeded default admin account (username='{}'). Sign in and change the password immediately — " +
            "override SEED_ADMIN_USERNAME/SEED_ADMIN_PASSWORD env vars before deploying anywhere shared.",
            seedUsername
        );
    }
}
