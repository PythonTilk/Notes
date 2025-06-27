package com.notevault.controller;

import lombok.RequiredArgsConstructor;
import com.notevault.model.Note;
import com.notevault.service.NoteService;
import com.notevault.service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpSession;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class WebController {

    private final NoteService noteService;
    private final UserService userService;

    @GetMapping("/")
    public String home() {
        return "redirect:/board";
    }
    
    @GetMapping("/login")
    public String login() {
        return "login";
    }
    
    @GetMapping("/register")
    public String register() {
        return "register";
    }
    
    @GetMapping("/verify-email")
    public String verifyEmail(@RequestParam(required = false) String token, Model model) {
        model.addAttribute("token", token);
        return "verify-email";
    }
    
    @GetMapping("/forgot-password")
    public String forgotPassword() {
        return "forgot-password";
    }
    
    @GetMapping("/reset-password")
    public String resetPassword(@RequestParam(required = false) String token, Model model) {
        model.addAttribute("token", token);
        return "reset-password";
    }
    
    @GetMapping("/board")
    public String board(Model model, HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        
        if (userId == null) {
            return "redirect:/login";
        }
        
        try {
            List<Note> notes = noteService.getAllNotesByUser(userId);
            
            // Add default positions and colors if needed
            for (Note note : notes) {
                if (note.getPositionX() == null) {
                    note.setPositionX(50);
                }
                if (note.getPositionY() == null) {
                    note.setPositionY(50);
                }
                if (note.getColor() == null) {
                    note.setColor("#FFFF88");
                }
            }
            
            model.addAttribute("notes", notes);
            model.addAttribute("username", session.getAttribute("username"));
            model.addAttribute("currentUserId", userId);
            model.addAttribute("isAdmin", session.getAttribute("isAdmin"));
            
            return "board";
        } catch (Exception e) {
            model.addAttribute("error", "Failed to load notes: " + e.getMessage());
            model.addAttribute("username", session.getAttribute("username"));
            model.addAttribute("currentUserId", userId);
            model.addAttribute("isAdmin", session.getAttribute("isAdmin"));
            return "board";
        }
    }
    
    @GetMapping("/search")
    public String search(@RequestParam String searchTerm, Model model, HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) {
            return "redirect:/login";
        }
        
        try {
            List<Note> notes = noteService.searchNotes(userId, searchTerm);
            
            model.addAttribute("notes", notes);
            model.addAttribute("searchTerm", searchTerm);
            model.addAttribute("username", session.getAttribute("username"));
            model.addAttribute("currentUserId", userId);
            model.addAttribute("isAdmin", session.getAttribute("isAdmin"));
            
            return "board";
        } catch (Exception e) {
            model.addAttribute("error", "Failed to search notes: " + e.getMessage());
            model.addAttribute("username", session.getAttribute("username"));
            model.addAttribute("currentUserId", userId);
            model.addAttribute("isAdmin", session.getAttribute("isAdmin"));
            return "board";
        }
    }
    
    @GetMapping("/profile/{userId}")
    public String profile(@PathVariable Integer userId, Model model, HttpSession session) {
        Integer currentUserId = (Integer) session.getAttribute("userId");
        if (currentUserId == null) {
            return "redirect:/login";
        }
        
        model.addAttribute("userId", userId);
        model.addAttribute("currentUserId", currentUserId);
        model.addAttribute("isAdmin", session.getAttribute("isAdmin"));
        return "profile";
    }
    
    @GetMapping("/admin")
    public String adminPanel(Model model, HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        Boolean isAdmin = (Boolean) session.getAttribute("isAdmin");
        
        if (userId == null) {
            return "redirect:/login";
        }
        
        if (isAdmin == null || !isAdmin) {
            return "redirect:/board";
        }
        
        model.addAttribute("username", session.getAttribute("username"));
        model.addAttribute("currentUserId", userId);
        model.addAttribute("isAdmin", true);
        return "admin";
    }
    
    @GetMapping("/admin/users")
    public String adminUsers(Model model, HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        Boolean isAdmin = (Boolean) session.getAttribute("isAdmin");
        
        if (userId == null) {
            return "redirect:/login";
        }
        
        if (isAdmin == null || !isAdmin) {
            return "redirect:/board";
        }
        
        model.addAttribute("username", session.getAttribute("username"));
        model.addAttribute("currentUserId", userId);
        model.addAttribute("isAdmin", true);
        return "admin-users";
    }
    
    @GetMapping("/admin/users/{userId}")
    public String adminUserDetail(@PathVariable Integer userId, Model model, HttpSession session) {
        Integer currentUserId = (Integer) session.getAttribute("userId");
        Boolean isAdmin = (Boolean) session.getAttribute("isAdmin");
        
        if (currentUserId == null) {
            return "redirect:/login";
        }
        
        if (isAdmin == null || !isAdmin) {
            return "redirect:/board";
        }
        
        model.addAttribute("username", session.getAttribute("username"));
        model.addAttribute("currentUserId", currentUserId);
        model.addAttribute("userId", userId);
        model.addAttribute("isAdmin", true);
        return "admin-user-detail";
    }
    
    @GetMapping("/admin/banned-emails")
    public String adminBannedEmails(Model model, HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        Boolean isAdmin = (Boolean) session.getAttribute("isAdmin");
        
        if (userId == null) {
            return "redirect:/login";
        }
        
        if (isAdmin == null || !isAdmin) {
            return "redirect:/board";
        }
        
        model.addAttribute("username", session.getAttribute("username"));
        model.addAttribute("currentUserId", userId);
        model.addAttribute("isAdmin", true);
        return "admin-banned-emails";
    }
}