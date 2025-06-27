package com.notevault.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "banned_emails")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BannedEmail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "banned_at", nullable = false)
    private LocalDateTime bannedAt = LocalDateTime.now();

    @Column(name = "banned_by")
    private Integer bannedBy;
}