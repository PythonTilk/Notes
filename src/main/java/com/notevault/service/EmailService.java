package com.notevault.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.base-url}")
    private String baseUrl;

    public void sendEmail(String to, String subject, String templateName, Map<String, Object> variables) throws MessagingException {
        Context context = new Context();
        variables.forEach(context::setVariable);
        context.setVariable("baseUrl", baseUrl);
        
        String htmlContent = templateEngine.process(templateName, context);
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        
        mailSender.send(message);
    }

    public void sendVerificationEmail(String to, String username, String token) throws MessagingException {
        String verificationUrl = baseUrl + "/verify-email?token=" + token;
        
        Map<String, Object> variables = Map.of(
            "username", username,
            "verificationUrl", verificationUrl
        );
        
        sendEmail(to, "Verify Your Email - NoteVault", "email-verification", variables);
    }

    public void sendPasswordResetEmail(String to, String username, String token) throws MessagingException {
        String resetUrl = baseUrl + "/reset-password?token=" + token;
        
        Map<String, Object> variables = Map.of(
            "username", username,
            "resetUrl", resetUrl
        );
        
        sendEmail(to, "Reset Your Password - NoteVault", "password-reset", variables);
    }

    public void sendBannedNotification(String to, String username, String reason) throws MessagingException {
        Map<String, Object> variables = Map.of(
            "username", username,
            "reason", reason != null ? reason : "Violation of terms of service"
        );
        
        sendEmail(to, "Account Banned - NoteVault", "account-banned", variables);
    }
}