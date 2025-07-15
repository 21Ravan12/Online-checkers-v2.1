package com.example.CheckerServer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import static org.springframework.security.config.Customizer.withDefaults;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(withDefaults()) 
            .csrf(csrf -> csrf.disable()) 
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/users/register", 
                    "/api/users/verifyForRegister", 
                    "/api/users/login", 
                    "/api/users/changeCode", 
                    "/api/users/verifyForChangeCode", 
                    "/api/users/changeCodeEnd", 
                    "/api/users/giveTierAndRetract", 
                    "/api/users/update", 
                    "/api/users/search", 
                    "/api/users/delete",
                    "/api/games/save",
                    "/api/games/search",
                    "/api/games/get"
                ).permitAll() 
                .anyRequest().authenticated() 
            );

        return http.build(); 
    }
}
