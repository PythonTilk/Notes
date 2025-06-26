package com.notevault.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "nutzer")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "b_id", nullable = false)
    private Integer bId = 0;

    @Column(name = "benutzername", nullable = false, unique = true, length = 20)
    private String username;

    @Column(name = "passwort", nullable = false, length = 60)
    private String password;

    @Column(name = "display_name", length = 50)
    private String displayName;

    @Column(name = "biography", length = 500)
    private String biography;

    @Column(name = "profile_picture", length = 255)
    private String profilePicture;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Note> notes = new ArrayList<>();
}