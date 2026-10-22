package com.example.CheckerServer.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.CheckerServer.model.User;

@Repository
public interface UserRepository extends MongoRepository<User, Long> {

    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);

    Optional<User> findByName(String name);
    
    Optional<User> findByBirthyear(Integer birthyear);
    
}
