package com.example.CheckerServer.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.CheckerServer.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);

    Optional<User> findByName(String name);
    
    Optional<User> findByBirthyear(Integer birthyear);
    
}
