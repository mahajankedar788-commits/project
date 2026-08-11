package com.ssit.examportal.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class PasswordGenerator {

    private static final String UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I/O to avoid ambiguity
    private static final String LOWER = "abcdefghijkmnpqrstuvwxyz"; // no l
    private static final String DIGITS = "23456789"; // no 0/1
    private static final String SYMBOLS = "!@#$%&*";
    private static final String ALL = UPPER + LOWER + DIGITS + SYMBOLS;

    private final SecureRandom random = new SecureRandom();

    /** Generates a 10-character password guaranteed to contain all four character classes. */
    public String generate() {
        return generate(10);
    }

    public String generate(int length) {
        if (length < 4) {
            throw new IllegalArgumentException("Password length must be at least 4");
        }

        List<Character> chars = new ArrayList<>(length);
        chars.add(pick(UPPER));
        chars.add(pick(LOWER));
        chars.add(pick(DIGITS));
        chars.add(pick(SYMBOLS));

        for (int i = chars.size(); i < length; i++) {
            chars.add(pick(ALL));
        }

        Collections.shuffle(chars, random);

        StringBuilder sb = new StringBuilder(length);
        chars.forEach(sb::append);
        return sb.toString();
    }

    private char pick(String source) {
        return source.charAt(random.nextInt(source.length()));
    }
}
