package com.example.CheckerServer.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.util.Base64;
import java.util.Date;

public class JwtUtil {
    private static final String SECRET_KEY = Base64.getEncoder().encodeToString("MySuperSecretKeyWithEnoughLength".getBytes());

    public static String generateTokenForLogin(String email) {
        return Jwts.builder()
                .setSubject(email)  
                .setIssuedAt(new Date()) 
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))  
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()), SignatureAlgorithm.HS256)  
                .compact();
    }
}
