package com.example.CheckerServer.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.CheckerServer.model.UserVerification;

public interface UserVerificationRepository extends JpaRepository<UserVerification, String> {

    Optional<UserVerification> findByEmail(String email);
}
