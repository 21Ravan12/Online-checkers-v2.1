package com.example.CheckerServer.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
        
            message.setFrom(fromEmail);
        
            message.setTo(toEmail);
        
            message.setSubject(subject);
        
            message.setText(body);
        
            mailSender.send(message);
        } catch (MailException e) {
            throw new IllegalStateException(e.getMessage());
        }
    }
}
