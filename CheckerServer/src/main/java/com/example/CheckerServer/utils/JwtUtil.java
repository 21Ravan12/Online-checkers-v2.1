package com.example.CheckerServer.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.util.Base64;
import java.util.Date;

public class JwtUtil {
    private static final String SECRET_KEY = Base64.getEncoder().encodeToString("MySuperSecretKeyWithEnoughLength".getBytes());

    public static String generateTokenForRegister(String email, String verificationCode) {
        return Jwts.builder()
                .setSubject(email)  
                .claim("verificationCode", verificationCode)  
                .setIssuedAt(new Date()) 
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))  
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()), SignatureAlgorithm.HS256)  
                .compact();
    }

    public static String generateTokenForLogin(String email) {
        return Jwts.builder()
                .setSubject(email)  
                .setIssuedAt(new Date()) 
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))  
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()), SignatureAlgorithm.HS256)  
                .compact();
    }
    

    public static String extractEmail(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))  
                .build()
                .parseClaimsJws(token)  
                .getBody()
                .getSubject(); 
    }

    public static String extractVerificationCode(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))  
                .build()
                .parseClaimsJws(token)  
                .getBody()
                .get("verificationCode", String.class);  
    }

    public static boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))  
                    .build()
                    .parseClaimsJws(token);  
            return true;  
        } catch (Exception e) {
            return false;  
        }
    }
}
