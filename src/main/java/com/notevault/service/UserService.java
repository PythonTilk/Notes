package com.notevault.service;

import lombok.RequiredArgsConstructor;
import com.notevault.model.User;
import com.notevault.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final BannedEmailService bannedEmailService;
    private final EmailService emailService;

    public User registerNewUser(String username, String password, String email) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }
        
        if (bannedEmailService.isEmailBanned(email)) {
            throw new RuntimeException("This email is not allowed to register");
        }
        
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setBId(0); // Default value for b_id
        user.setIsAdmin(false);
        user.setIsBanned(false);
        user.setEmailVerified(false);
        
        // Generate verification token
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusDays(1));
        
        User savedUser = userRepository.save(user);
        
        // Send verification email
        try {
            emailService.sendVerificationEmail(email, username, verificationToken);
        } catch (MessagingException e) {
            // Log the error but don't prevent registration
            System.err.println("Failed to send verification email: " + e.getMessage());
        }
        
        return savedUser;
    }
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public boolean verifyEmail(String token) {
        Optional<User> userOpt = userRepository.findByVerificationToken(token);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Check if token is expired
            if (user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
                return false;
            }
            
            user.setEmailVerified(true);
            user.setVerificationToken(null);
            user.setVerificationTokenExpiry(null);
            userRepository.save(user);
            return true;
        }
        return false;
    }
    
    public boolean requestPasswordReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Check if user is banned
            if (user.getIsBanned()) {
                return false;
            }
            
            // Generate password reset token
            String resetToken = UUID.randomUUID().toString();
            user.setPasswordResetToken(resetToken);
            user.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);
            
            // Send password reset email
            try {
                emailService.sendPasswordResetEmail(email, user.getUsername(), resetToken);
                return true;
            } catch (MessagingException e) {
                System.err.println("Failed to send password reset email: " + e.getMessage());
                return false;
            }
        }
        return false;
    }
    
    public boolean resetPassword(String token, String newPassword) {
        Optional<User> userOpt = userRepository.findByPasswordResetToken(token);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Check if token is expired
            if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
                return false;
            }
            
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setPasswordResetToken(null);
            user.setPasswordResetTokenExpiry(null);
            userRepository.save(user);
            return true;
        }
        return false;
    }
    
    public boolean checkCredentials(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Check if user is banned
            if (user.getIsBanned()) {
                return false;
            }
            
            // Check if password is BCrypt encoded (starts with $2a$, $2b$, or $2y$)
            if (user.getPassword().startsWith("$2")) {
                boolean matches = passwordEncoder.matches(password, user.getPassword());
                if (matches) {
                    // Update last login time
                    user.setLastLogin(LocalDateTime.now());
                    userRepository.save(user);
                }
                return matches;
            } else {
                // For backward compatibility with plain text passwords
                boolean matches = password.equals(user.getPassword());
                if (matches) {
                    // Update last login time
                    user.setLastLogin(LocalDateTime.now());
                    userRepository.save(user);
                }
                return matches;
            }
        }
        return false;
    }
    
    public List<User> searchUsers(String searchTerm, Integer excludeUserId) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return userRepository.findAll().stream()
                    .filter(user -> !user.getId().equals(excludeUserId))
                    .limit(10)
                    .collect(Collectors.toList());
        }
        
        return userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(excludeUserId))
                .filter(user -> user.getUsername().toLowerCase().contains(searchTerm.toLowerCase()) || 
                               (user.getEmail() != null && user.getEmail().toLowerCase().contains(searchTerm.toLowerCase())))
                .limit(10)
                .collect(Collectors.toList());
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public Optional<User> findById(Integer id) {
        return userRepository.findById(id);
    }
    
    public User updateProfile(Integer userId, String displayName, String biography, String profilePicture) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            if (displayName != null) {
                user.setDisplayName(displayName);
            }
            
            if (biography != null) {
                user.setBiography(biography);
            }
            
            if (profilePicture != null && !profilePicture.trim().isEmpty()) {
                user.setProfilePicture(profilePicture);
            }
            
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found");
    }
    
    public String getDisplayName(User user) {
        if (user.getDisplayName() != null && !user.getDisplayName().trim().isEmpty()) {
            return user.getDisplayName();
        }
        return user.getUsername();
    }
    
    public User banUser(Integer userId, String reason, Integer bannedById) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Don't allow banning admins
            if (user.getIsAdmin()) {
                throw new RuntimeException("Cannot ban an admin user");
            }
            
            user.setIsBanned(true);
            User bannedUser = userRepository.save(user);
            
            // Ban the email as well
            bannedEmailService.banEmail(user.getEmail(), reason, bannedById);
            
            // Send banned notification email
            try {
                emailService.sendBannedNotification(user.getEmail(), user.getUsername(), reason);
            } catch (MessagingException e) {
                System.err.println("Failed to send banned notification email: " + e.getMessage());
            }
            
            return bannedUser;
        }
        throw new RuntimeException("User not found");
    }
    
    public User unbanUser(Integer userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsBanned(false);
            User unbannedUser = userRepository.save(user);
            
            // Unban the email as well
            try {
                bannedEmailService.unbanEmail(user.getEmail());
            } catch (RuntimeException e) {
                // Email might not be in the banned list, ignore
            }
            
            return unbannedUser;
        }
        throw new RuntimeException("User not found");
    }
    
    public User grantAdminPrivileges(Integer userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsAdmin(true);
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found");
    }
    
    public User revokeAdminPrivileges(Integer userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setIsAdmin(false);
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found");
    }
    
    public List<User> getAllAdmins() {
        return userRepository.findByIsAdmin(true);
    }
    
    public boolean isAdmin(Integer userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        return userOpt.map(User::getIsAdmin).orElse(false);
    }
    
    public boolean resendVerificationEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Check if already verified
            if (user.getEmailVerified()) {
                return false;
            }
            
            // Generate new verification token
            String verificationToken = UUID.randomUUID().toString();
            user.setVerificationToken(verificationToken);
            user.setVerificationTokenExpiry(LocalDateTime.now().plusDays(1));
            userRepository.save(user);
            
            // Send verification email
            try {
                emailService.sendVerificationEmail(email, user.getUsername(), verificationToken);
                return true;
            } catch (MessagingException e) {
                System.err.println("Failed to send verification email: " + e.getMessage());
                return false;
            }
        }
        return false;
    }
}