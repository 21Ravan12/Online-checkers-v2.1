package com.example.CheckerServer.dto;

public class UserRequest {
    private String email;  
    private String password; 
    private String token;  
    private String code; 
    private String name;  
    private int birthyear;  
    private String profilePicture;
    

    public String getEmail() {
        return email;  
    }

    public void setEmail(String email) {
        this.email = email;  
    }

    public String getPassword() {
        return password;  
    }

    public void setPassword(String password) {
        this.password = password;  
    }

    public String getToken() {
        return token;  
    }

    public void setToken(String token) {
        this.token = token;  
    }

    public String getCode() {
        return code;  
    }

    public void setCode(String code) {
        this.code = code;  
    }

    public String getName() {
        return name;  
    }

    public void setName(String name) {
        this.name = name;  
    }

    public int getBirthyear() {
        return birthyear;  
    }

    public void setBirthyear(int birthyear) {
        this.birthyear = birthyear;  
    }

    public String getProfilePicture() { 
        return profilePicture; 
    }

    public void setProfilePicture(String profilePicture) { 
        this.profilePicture = profilePicture; 
    }
}
