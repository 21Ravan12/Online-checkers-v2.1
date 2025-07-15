package com.example.CheckerServer.controller;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.CheckerServer.dto.UserRequest;
import com.example.CheckerServer.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRequest userRequest) {
        try {
            String message = userService.registerUser(
                userRequest.getEmail(),
                userRequest.getPassword(),
                userRequest.getName(),
                userRequest.getBirthyear(),
                userRequest.getProfilePicture() 
            );
            return ResponseEntity.ok(message);
        } catch (Exception  e) {
            JSONObject response = new JSONObject();
            response.put("error", e.getMessage());
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body(response.toString()); 
        }
    }    

    @PostMapping("/verifyForRegister")
    public ResponseEntity<?> verifyForRegister(@RequestBody UserRequest userRequest) {
        try {
            String message = userService.verifyUser(
                userRequest.getCode(),
                userRequest.getToken()
            );
            
            return ResponseEntity.ok(message); 
        } catch (Exception e) {
            JSONObject response = new JSONObject();
            response.put("error", e.getMessage());
            System.out.println(e.getMessage());
            return ResponseEntity.badRequest().body(response.toString()); 
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserRequest userRequest) {
        try {
            String message = userService.loginUser(
                userRequest.getEmail(),
                userRequest.getPassword()
            );
            return ResponseEntity.ok(message); 
        } catch (Exception e) {
            JSONObject response = new JSONObject();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response.toString()); 
        }
    }

    @PostMapping("/changeCode")
    public ResponseEntity<?> changeCode(@RequestBody UserRequest userRequest) {
        try {
            String message = userService.changeUserCode(
                userRequest.getEmail()
            ); 
            return ResponseEntity.ok(message); 
        } catch (Exception e) {
            JSONObject response = new JSONObject();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response.toString()); 
        }
    }

    @PostMapping("/verifyForChangeCode")
    public ResponseEntity<?> verifyForChangeCode(@RequestBody UserRequest userRequest) {
        try {
            String message = userService.verifyUserForChangeCode(
                userRequest.getCode(),
                userRequest.getToken()
            );
            return ResponseEntity.ok(message); 
        } catch (Exception e) {
            JSONObject response = new JSONObject();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response.toString());         
        }
    }

    @PostMapping("/changeCodeEnd")
    public ResponseEntity<?> changeCodeEnd(@RequestBody UserRequest userRequest) {
        try {
            String message = userService.changeUserCodeEnd(
                userRequest.getToken(),
                userRequest.getPassword()
            );
            return ResponseEntity.ok(message); 
        } catch (Exception e) {
            JSONObject response = new JSONObject();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response.toString());           
        }
    }

    @PostMapping("/update")
    public ResponseEntity<?> uptade(@RequestBody UserRequest userRequest) {
        try {
            String message = userService.updateUser(
                userRequest.getEmail(),
                userRequest.getPassword(),
                userRequest.getName(),
                userRequest.getBirthyear()
            );
            return ResponseEntity.ok(message); 
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage()); 
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchUser(
        @RequestParam(required = false) Long id,
        @RequestParam(required = false) String email,
        @RequestParam(required = false) String name,
        @RequestParam(required = false) Integer birthYear) {
    
        Integer age = (birthYear != null && birthYear > 0) ? birthYear : null;
        
        System.out.println(id+email+name+birthYear);

        try {
            String userInfo = userService.searchUser(id, email, name, age);
    
            if (userInfo.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No users found matching the criteria.");
            }
            System.out.println(userInfo);
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            JSONObject response = new JSONObject();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response.toString());           
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> delete(@RequestBody UserRequest userRequest) {
        String email = userRequest.getEmail();

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Invalid input: Email parameter is required.");
        }

        try {
            userService.deleteUser(email.trim());
            return ResponseEntity.ok("User with email " + email + " has been successfully deleted.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage()); 
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("An unexpected error occurred.");
        }
    }
}
