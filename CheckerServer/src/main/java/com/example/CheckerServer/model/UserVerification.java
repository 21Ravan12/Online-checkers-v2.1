package com.example.CheckerServer.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity 
public class UserVerification {

    @Id 
    private String email;  

    private String code;  

    private String password;  

    private String name;  

    private int birthYear;  

    @Column(nullable = true, length = 10000)
    private String profilePicture;



    public String getEmail() {
        return email;  
    }

    public void setEmail(String email) {
        this.email = email;  
    }

    public String getCode() {
        return code;  
    }

    public void setCode(String code) {
        this.code = code;  
    }

    public String getPassword() {
        return password;  
    }

    public void setPassword(String password) {
        this.password = password;  
    }

    public String getName() {
        return name; 
    }

    public void setName(String name) {
        this.name = name;  
    }

    public int getBirthYear() {
        return birthYear;  
    }

    public void setBirthYear(int birthYear) {
        this.birthYear = birthYear;  
    }
    
    public String getProfilePicture() { 
        return profilePicture; 
    }

    public void setProfilePicture(String profilePicture) { 
        this.profilePicture = profilePicture; 
    }
}
