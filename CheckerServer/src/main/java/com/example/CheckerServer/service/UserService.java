package com.example.CheckerServer.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.CheckerServer.authSecurityService.LoginAttemptService;
import com.example.CheckerServer.model.User;
import com.example.CheckerServer.model.UserVerification;
import com.example.CheckerServer.repository.UserRepository;
import com.example.CheckerServer.repository.UserVerificationRepository;
import com.example.CheckerServer.utils.JwtUtil;



@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    private final UserVerificationRepository userVerificationRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final EmailService emailService;
    private final Map<String, String> verificationCodes = new HashMap<>();
    private final Map<String, String> tokenCache = new HashMap<>();
    private final LoginAttemptService loginAttemptService = new LoginAttemptService();

    public UserService(EmailService emailService, UserVerificationRepository userVerificationRepository) {
        this.emailService = emailService;
        this.userVerificationRepository = userVerificationRepository;
    }    

    public String registerUser(String email, String password, String name, int birthYear, String profilePicture) {
        if (email == null || !loginAttemptService.isValidEmail(email)) {
            System.out.println("Invalid email format: " + email);
            throw new IllegalArgumentException("Invalid email format.");
        }
        
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("This email is already registered.");
        }
    
        //if (!loginAttemptService.isValidPassword(password)) {
        //    throw new IllegalArgumentException("Password is too weak. It must be at least 8 characters long and contain uppercase, lowercase, number, and special character.");
        //}
    
        if (birthYear > (2025 - 18)) {  
            throw new IllegalArgumentException("You must be at least 18 years old to register.");
        }
    
        if (verificationCodes.containsKey(email)) {
            throw new IllegalArgumentException("A verification code has already been sent to this email. Please check your email.");
        }
    
        String verificationCode = generateVerificationCode();
    
        UserVerification userVerification = new UserVerification();
        userVerification.setEmail(email);
        userVerification.setCode(verificationCode);
        userVerification.setPassword(passwordEncoder.encode(password));  
        userVerification.setName(name);
        userVerification.setBirthYear(birthYear);
        userVerification.setProfilePicture(profilePicture);
    
        userVerificationRepository.save(userVerification);
       
        String token = JwtUtil.generateTokenForRegister(email, verificationCode);
        tokenCache.put(email, token);
        
        try {
            emailService.sendEmail(email, "Verification Code", "Your verification code: " + verificationCode);
        } catch (Exception e) {
            throw new IllegalStateException(e.getMessage());
        }
    
        JSONObject response = new JSONObject();
        response.put("message", "A verification code has been sent to your email. Please use this code to complete your registration.");
        response.put("jwt_token", token);
    
        return response.toString();
    }
    
    public String verifyUser(String code, String token) {
        if (!JwtUtil.validateToken(token)) {
            throw new IllegalArgumentException("Invalid or expired token.");
        }
    
        if (!JwtUtil.extractVerificationCode(token).equals(code)) {
            throw new IllegalArgumentException("Invalid verification code.");
        }
    
        String email = JwtUtil.extractEmail(token);

        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("User with this email is already registered.");
        }

        Optional<UserVerification> verificationOptional = userVerificationRepository.findByEmail(email);
    
        if (verificationOptional.isEmpty()) {
            throw new IllegalStateException("No verification record found for this email.");
        }
    
        UserVerification verification = verificationOptional.get();

    
        User user = new User();
        user.setEmail(email);
        user.setPassword(verification.getPassword());
        user.setName(verification.getName());
        user.setBirthyear(verification.getBirthYear());
        user.setProfilePicture(verification.getProfilePicture());
    
        try {
            userRepository.save(user);
            System.out.println("User successfully registered.");
        } catch (Exception e) {
            System.out.println("Error occurred while saving user: " + e.getMessage());
            throw new IllegalStateException("User could not be saved.");
        }
    
        try {
            userVerificationRepository.delete(verification);
            System.out.println("Verification record deleted.");
        } catch (Exception e) {
            System.out.println("Error occurred while deleting verification record: " + e.getMessage());
            throw new IllegalStateException("Verification record could not be deleted.");
        }
        JSONObject response = new JSONObject();
        response.put("message", "User successfully registered.");
    
        return response.toString();
    }
    
    private String generateVerificationCode() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(999999)); 
    }

    public String loginUser(String email, String password) {
        if (email == null || email.isEmpty() || !loginAttemptService.isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        if (loginAttemptService.isLocked(email)) {
            throw new IllegalArgumentException("Too many failed login attempts. Try again later.");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            if (passwordEncoder.matches(password, user.getPassword())) {
                loginAttemptService.resetFailedAttempts(email); 
                String token = JwtUtil.generateTokenForLogin(email);
                tokenCache.put(email, token);
                JSONObject response = new JSONObject();
                response.put("message", "Login successful!");
                response.put("user_id", user.getId());
                response.put("name", user.getName()); 
                response.put("email", user.getEmail());
                response.put("birthyear", user.getBirthyear());
                response.put("profilePicture", user.getProfilePicture()); 
                response.put("jwt_token", token);
            
                return response.toString();
            }
        }

        loginAttemptService.incrementFailedAttempts(email); 
        throw new IllegalArgumentException("Invalid email or password.");
    }
    
    public String changeUserCode(String email) {
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("Email address cannot be empty.");
        }
    
        if (verificationCodes.containsKey(email)) {
            throw new IllegalArgumentException("Email is already waiting for verification.");
        }
    
        String verificationCode = generateVerificationCode();
        
        emailService.sendEmail(email, "Verification Code", "Your new verification code: " + verificationCode);
        
        String token = JwtUtil.generateTokenForRegister(email, verificationCode);
        tokenCache.put(email, token);

        JSONObject response = new JSONObject();
        response.put("message", "A new verification code has been sent to your email. You can complete your registration by entering the code");
        response.put("jwt_token", token);
    
        return response.toString();
    }
    
    public String verifyUserForChangeCode(String code, String token) { 
        if (!JwtUtil.validateToken(token)) {
            throw new IllegalArgumentException("Invalid or expired token.");
        }
        
        String tokenVerificationCode = JwtUtil.extractVerificationCode(token);
        if (!tokenVerificationCode.equals(code)) {
            throw new IllegalArgumentException("Invalid verification code.");
        }
    
        JSONObject response = new JSONObject();
        response.put("message", "Verification successful!");
    
        return response.toString();
    }
    
    public String changeUserCodeEnd(String token, String newPassword) {
        if (token == null || token.isEmpty()) {
            throw new IllegalArgumentException("Email address cannot be empty.");
        }
        if (newPassword == null || newPassword.isEmpty()) {
            throw new IllegalArgumentException("New password cannot be empty.");
        }
    
        String email = JwtUtil.extractEmail(token);
    
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("No user found with this email address.");
        }
    
        User user = userOptional.get();
        user.setPassword(passwordEncoder.encode(newPassword)); 
        userRepository.save(user); 
    
        JSONObject response = new JSONObject();
        response.put("message", "Password successfully updated. You can now use the new password.");
    
        return response.toString();
    }
    
    public String updateUser(String email, String password, String name, int birthYear) {
        if (verificationCodes.containsKey(email)) {
            throw new IllegalArgumentException("Email is awaiting verification.");
        }
    
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("No user found with this email address.");
        }
    
        User user = userOptional.get();
        
        if (name != null) user.setName(name);
        if (birthYear > 0) user.setBirthyear(birthYear);
        if (password != null && !password.isEmpty()) user.setPassword(passwordEncoder.encode(password));
    
        userRepository.save(user);
    
        return "User successfully updated.";
    }
        
    public String searchUser(Long id, String email, String name, Integer birthyear) {
        try {
            JSONObject response = new JSONObject();
            Optional<User> user = null;
    
            if (id != null) {
                user = userRepository.findById(id);
            } else if (email != null) {
                user = userRepository.findByEmail(email);
            } else if (name != null) {
                user = userRepository.findByName(name);
            } else if (birthyear != null) {
                user = userRepository.findByBirthyear(birthyear);
            } 
    
            if (user != null) {
                User usetData = user.get();
                response.put("name", usetData.getName()); 
                response.put("profilePicture", usetData.getProfilePicture()); 
            } else {
                throw new IllegalArgumentException("No user found matching the criteria.");
            }
    
            return response.toString(); 
    
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("An error occurred while searching for users.", e);
        } catch (JSONException e) {
            throw new IllegalStateException("An error occurred while processing the response.", e);
        }
    }

    public void deleteUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User with email " + email + " not found."));

        userRepository.delete(user);
    }

    public Map<String, String> getVerificationCodes() {
        return verificationCodes;
    }

    public Map<String, String> getTokenCache() {
        return tokenCache;
    }
}

