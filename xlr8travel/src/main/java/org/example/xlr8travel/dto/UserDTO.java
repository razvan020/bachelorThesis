package org.example.xlr8travel.dto; // Or your appropriate DTO package

import lombok.Getter;
import lombok.Setter;
import org.example.xlr8travel.models.Role; // Assuming Role is an Enum or similar

import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String firstname; // Added based on User model
    private String lastname;  // Added based on User model
    private Set<String> roles; // Return roles as simple strings
    // Add other non-sensitive fields as needed (e.g., accountStatus as String)

    // Constructor or static factory method for mapping
    public static UserDTO fromUser(org.example.xlr8travel.models.User user) {
        if (user == null) {
            return null;
        }
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstname(user.getFirstname());
        dto.setLastname(user.getLastname());
        // Map Role objects/enums to String representations
        if (user.getRoles() != null) {
            dto.setRoles(user.getRoles().stream().map(Role::name).collect(Collectors.toSet()));
        }
        // Map other fields...
        return dto;
    }
}