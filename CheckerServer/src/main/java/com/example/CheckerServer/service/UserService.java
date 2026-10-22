package com.example.CheckerServer.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.CheckerServer.authSecurityService.LoginAttemptService;
import com.example.CheckerServer.model.User;
import com.example.CheckerServer.repository.UserRepository;
import com.example.CheckerServer.utils.JwtUtil;



@Service
public class UserService {

    private final UserRepository userRepository;
    private final IdSequenceService idSequenceService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final Map<String, String> verificationCodes = new HashMap<>();
    private final Map<String, String> tokenCache = new HashMap<>();
    private final LoginAttemptService loginAttemptService = new LoginAttemptService();

    public UserService(
            UserRepository userRepository,
            IdSequenceService idSequenceService) {
        this.userRepository = userRepository;
        this.idSequenceService = idSequenceService;
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

        User user = new User();
        user.setId(idSequenceService.nextId("users"));
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name);
        user.setBirthyear(birthYear);
        user.setProfilePicture(profilePicture);

        userRepository.save(user);

        JSONObject response = new JSONObject();
        response.put("message", "User successfully registered. You can now log in.");
    
        return response.toString();
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
