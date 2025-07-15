package com.example.CheckerServer.authSecurityService;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class LoginAttemptService {
    private static final int MAX_ATTEMPTS = 5; 
    private static final long LOCK_TIME = TimeUnit.MINUTES.toMillis(15); 

    private final Map<String, Integer> attemptsCache = new ConcurrentHashMap<>();
    private final Map<String, Long> lockTimeCache = new ConcurrentHashMap<>();

    public void incrementFailedAttempts(String email) {
        int attempts = attemptsCache.getOrDefault(email, 0);
        attempts++;

        if (attempts >= MAX_ATTEMPTS) {
            lockTimeCache.put(email, System.currentTimeMillis()); 
        }

        attemptsCache.put(email, attempts);
    }

    public void resetFailedAttempts(String email) {
        attemptsCache.remove(email);
        lockTimeCache.remove(email);
    }

    public int getFailedAttempts(String email) {
        if (isLocked(email)) {
            return MAX_ATTEMPTS; 
        }
        return attemptsCache.getOrDefault(email, 0);
    }

    public boolean isLocked(String email) {
        if (!lockTimeCache.containsKey(email)) {
            return false;
        }

        long lockTime = lockTimeCache.get(email);
        long elapsedTime = System.currentTimeMillis() - lockTime;

        if (elapsedTime >= LOCK_TIME) {
            resetFailedAttempts(email); 
            return false;
        }
        return true;
    }
    
    // RFC 5322 Official Standard (simplified for practicality)
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    public boolean isValidEmail(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }

    
    public boolean isValidPassword(String password) {
        String passwordRegex = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?])(?=.{8,})";
        Pattern pattern = Pattern.compile(passwordRegex);
        Matcher matcher = pattern.matcher(password);
        return matcher.matches();
    }
    
    
}

