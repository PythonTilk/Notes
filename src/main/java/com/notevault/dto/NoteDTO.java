package com.notevault.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.notevault.model.Note;
import com.notevault.model.User;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoteDTO {
    private Integer id;
    private String title;
    private String tag;
    private String content;
    private Integer positionX;
    private Integer positionY;
    private String color;
    private Note.NoteType noteType;
    private String privacyLevel;
    private String sharedWith;
    private Boolean hasImages;
    private String imagePaths;
    private String editingPermission;
    
    // Author information
    private Integer authorId;
    private String authorUsername;
    private String authorDisplayName;
    private String authorProfilePicture;
    
    public static NoteDTO fromNote(Note note) {
        NoteDTO dto = new NoteDTO();
        dto.setId(note.getId());
        dto.setTitle(note.getTitle());
        dto.setTag(note.getTag());
        dto.setContent(note.getContent());
        dto.setPositionX(note.getPositionX());
        dto.setPositionY(note.getPositionY());
        dto.setColor(note.getColor());
        dto.setNoteType(note.getNoteType());
        dto.setPrivacyLevel(note.getPrivacyLevel() != null ? note.getPrivacyLevel().getValue() : "private");
        dto.setSharedWith(note.getSharedWith());
        dto.setHasImages(note.getHasImages());
        dto.setImagePaths(note.getImagePaths());
        dto.setEditingPermission(note.getEditingPermission() != null ? note.getEditingPermission().getValue() : "creator_only");
        
        // Set author information
        if (note.getUser() != null) {
            User author = note.getUser();
            dto.setAuthorId(author.getId());
            dto.setAuthorUsername(author.getUsername());
            dto.setAuthorDisplayName(author.getDisplayName() != null && !author.getDisplayName().trim().isEmpty() 
                ? author.getDisplayName() : author.getUsername());
            dto.setAuthorProfilePicture(author.getProfilePicture());
        }
        
        return dto;
    }
}