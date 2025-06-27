package com.notevault.controller.api;

import lombok.RequiredArgsConstructor;
import com.notevault.model.BannedEmail;
import com.notevault.model.User;
import com.notevault.service.BannedEmailService;
import com.notevault.service.NoteService;
import com.notevault.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final NoteService noteService;
    private final BannedEmailService bannedEmailService;

    // Helper method to check if the current user is an admin
    private boolean isAdmin(HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return false;
        }
        return userService.isAdmin(userId);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Unauthorized"));
        }

        try {
            List<User> users = userService.getAllUsers();
            
            List<Map<String, Object>> userList = users.stream()
                    .map(user -> {
                        Map<String, Object> userData = new HashMap<>();
                        userData.put("id", user.getId());
                        userData.put("username", user.getUsername());
                        userData.put("email", user.getEmail());
                        userData.put("displayName", userService.getDisplayName(user));
                        userData.put("isAdmin", user.getIsAdmin());
                        userData.put("isBanned", user.getIsBanned());
                        userData.put("emailVerified", user.getEmailVerified());
                        userData.put("createdAt", user.getCreatedAt());
                        userData.put("lastLogin", user.getLastLogin());
                        return userData;
                    })
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of("success", true, "users", userList));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "Error fetching users: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserDetails(@PathVariable Integer userId, HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Unauthorized"));
        }

        try {
            var userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "User not found"));
            }
            
            User user = userOpt.get();
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", user.getId());
            userData.put("username", user.getUsername());
            userData.put("email", user.getEmail());
            userData.put("displayName", userService.getDisplayName(user));
            userData.put("biography", user.getBiography());
            userData.put("profilePicture", user.getProfilePicture());
            userData.put("isAdmin", user.getIsAdmin());
            userData.put("isBanned", user.getIsBanned());
            userData.put("emailVerified", user.getEmailVerified());
            userData.put("createdAt", user.getCreatedAt());
            userData.put("lastLogin", user.getLastLogin());
            
            // Get user's notes
            var notes = noteService.getAllNotesByUser(userId);
            userData.put("notesCount", notes.size());
            
            return ResponseEntity.ok(Map.of("success", true, "user", userData));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "Error fetching user details: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/users/{userId}/notes")
    public ResponseEntity<?> getUserNotes(@PathVariable Integer userId, HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Unauthorized"));
        }

        try {
            var notes = noteService.getAllNotesByUser(userId);
            return ResponseEntity.ok(Map.of("success", true, "notes", notes));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "Error fetching user notes: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/users/{userId}/ban")
    public ResponseEntity<?> banUser(
            @PathVariable Integer userId, 
            @RequestParam(required = false) String reason,
            HttpSession session) {
        
        Integer currentUserId = (Integer) session.getAttribute("userId");
        if (currentUserId == null || !userService.isAdmin(currentUserId)) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Unauthorized"));
        }

        try {
            User bannedUser = userService.banUser(userId, reason, currentUserId);
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "User banned successfully",
                "user", Map.of(
                    "id", bannedUser.getId(),
                    "username", bannedUser.getUsername(),
                    "email", bannedUser.getEmail(),
                    "isBanned", bannedUser.getIsBanned()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "Error banning user: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/users/{userId}/unban")
    public ResponseEntity<?> unbanUser(@PathVariable Integer userId, HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Unauthorized"));
        }

        try {
            User unbannedUser = userService.unbanUser(userId);
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "User unbanned successfully",
                "user", Map.of(
                    "id", unbannedUser.getId(),
                    "username", unbannedUser.getUsername(),
                    "email", unbannedUser.getEmail(),
                    "isBanned", unbannedUser.getIsBanned()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "Error unbanning user: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/users/{userId}/grant-admin")
    public ResponseEntity<?> grantAdminPrivileges(@PathVariable Integer userId, HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Unauthorized"));
        }

        try {
            User user = userService.grantAdminPrivileges(userId);
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "Admin privileges granted successfully",
                "user", Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "isAdmin", user.getIsAdmin()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "Error granting admin privileges: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/users/{userId}/revoke-admin")
    public ResponseEntity<?> revokeAdminPrivileges(@PathVariable Integer userId, HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Unauthorized"));
        }

        try {
            User user = userService.revokeAdminPrivileges(userId);
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "Admin privileges revoked successfully",
                "user", Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "isAdmin", user.getIsAdmin()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "Error revoking admin privileges: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/banned-emails")
    public ResponseEntity<?> getBannedEmails(HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Unauthorized"));
        }

        try {
            List<BannedEmail> bannedEmails = bannedEmailService.getAllBannedEmails();
            return ResponseEntity.ok(Map.of("success", true, "bannedEmails", bannedEmails));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "Error fetching banned emails: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/banned-emails/add")
    public ResponseEntity<?> addBannedEmail(
            @RequestParam String email, 
            @RequestParam(required = false) String reason,
            HttpSession session) {
        
        Integer currentUserId = (Integer) session.getAttribute("userId");
        if (currentUserId == null || !userService.isAdmin(currentUserId)) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Unauthorized"));
        }

        try {
            BannedEmail bannedEmail = bannedEmailService.banEmail(email, reason, currentUserId);
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "Email banned successfully",
                "bannedEmail", bannedEmail
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "Error banning email: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/banned-emails/remove")
    public ResponseEntity<?> removeBannedEmail(@RequestParam String email, HttpSession session) {
        if (!isAdmin(session)) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", "Unauthorized"));
        }

        try {
            bannedEmailService.unbanEmail(email);
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "Email unbanned successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false, 
                "message", "Error unbanning email: " + e.getMessage()
            ));
        }
    }
}