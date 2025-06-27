package com.notevault.controller.api;

import lombok.RequiredArgsConstructor;
import com.notevault.model.User;
import com.notevault.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String username, 
                                  @RequestParam String password,
                                  HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        if (userService.checkCredentials(username, password)) {
            Optional<User> userOpt = userService.findByUsername(username);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                
                // Check if user is banned
                if (user.getIsBanned()) {
                    response.put("success", false);
                    response.put("message", "Your account has been banned");
                    return ResponseEntity.status(403).body(response);
                }
                
                // Check if email is verified
                if (!user.getEmailVerified()) {
                    response.put("success", false);
                    response.put("message", "Please verify your email before logging in");
                    response.put("needsVerification", true);
                    response.put("email", user.getEmail());
                    return ResponseEntity.status(403).body(response);
                }
                
                session.setAttribute("userId", user.getId());
                session.setAttribute("username", user.getUsername());
                session.setAttribute("isAdmin", user.getIsAdmin());
                
                response.put("success", true);
                response.put("userId", user.getId());
                response.put("username", user.getUsername());
                response.put("isAdmin", user.getIsAdmin());
                return ResponseEntity.ok(response);
            }
        }
        
        response.put("success", false);
        response.put("message", "Invalid username or password");
        return ResponseEntity.badRequest().body(response);
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestParam String username, 
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String confirmPassword) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (!password.equals(confirmPassword)) {
            response.put("success", false);
            response.put("message", "Passwords do not match");
            return ResponseEntity.badRequest().body(response);
        }
        
        try {
            User user = userService.registerNewUser(username, password, email);
            response.put("success", true);
            response.put("userId", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("message", "Registration successful. Please check your email to verify your account.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        Map<String, Object> response = new HashMap<>();
        
        boolean verified = userService.verifyEmail(token);
        if (verified) {
            response.put("success", true);
            response.put("message", "Email verified successfully. You can now log in.");
        } else {
            response.put("success", false);
            response.put("message", "Invalid or expired verification token");
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();
        
        boolean sent = userService.resendVerificationEmail(email);
        if (sent) {
            response.put("success", true);
            response.put("message", "Verification email sent. Please check your inbox.");
        } else {
            response.put("success", false);
            response.put("message", "Failed to send verification email. Please try again later.");
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();
        
        boolean sent = userService.requestPasswordReset(email);
        if (sent) {
            response.put("success", true);
            response.put("message", "Password reset instructions sent to your email.");
        } else {
            response.put("success", false);
            response.put("message", "Failed to process password reset request. Please try again later.");
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword,
            @RequestParam String confirmPassword) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (!newPassword.equals(confirmPassword)) {
            response.put("success", false);
            response.put("message", "Passwords do not match");
            return ResponseEntity.badRequest().body(response);
        }
        
        boolean reset = userService.resetPassword(token, newPassword);
        if (reset) {
            response.put("success", true);
            response.put("message", "Password reset successfully. You can now log in with your new password.");
        } else {
            response.put("success", false);
            response.put("message", "Invalid or expired reset token");
        }
        
        return ResponseEntity.ok(response);
    }
}