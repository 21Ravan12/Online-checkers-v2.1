package com.example.CheckerServer.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.CheckerServer.model.UserVerification;

public interface UserVerificationRepository extends MongoRepository<UserVerification, String> {

    Optional<UserVerification> findByEmail(String email);
}
