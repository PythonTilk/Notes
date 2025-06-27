package com.notevault.service;

import lombok.RequiredArgsConstructor;
import com.notevault.model.BannedEmail;
import com.notevault.repository.BannedEmailRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BannedEmailService {

    private final BannedEmailRepository bannedEmailRepository;

    public boolean isEmailBanned(String email) {
        return bannedEmailRepository.existsByEmail(email);
    }

    public BannedEmail banEmail(String email, String reason, Integer bannedBy) {
        if (isEmailBanned(email)) {
            throw new RuntimeException("Email is already banned");
        }
        
        BannedEmail bannedEmail = new BannedEmail();
        bannedEmail.setEmail(email);
        bannedEmail.setReason(reason);
        bannedEmail.setBannedAt(LocalDateTime.now());
        bannedEmail.setBannedBy(bannedBy);
        
        return bannedEmailRepository.save(bannedEmail);
    }

    public void unbanEmail(String email) {
        Optional<BannedEmail> bannedEmailOpt = bannedEmailRepository.findByEmail(email);
        if (bannedEmailOpt.isPresent()) {
            bannedEmailRepository.delete(bannedEmailOpt.get());
        } else {
            throw new RuntimeException("Email is not banned");
        }
    }

    public List<BannedEmail> getAllBannedEmails() {
        return bannedEmailRepository.findAll();
    }

    public Optional<BannedEmail> getBannedEmail(String email) {
        return bannedEmailRepository.findByEmail(email);
    }
}