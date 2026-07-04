package com.taskflow.dto;

import jakarta.validation.constraints.NotBlank;

public class WorkspaceDTOs {

    public record WorkspaceRequest(
        @NotBlank String name,
        String description,
        String color
    ) {}

    public record WorkspaceUpdateRequest(String name, String description, String color) {}

    public record WorkspaceDTO(
        Long id, String name, String description, String color,
        Long ownerId, Integer memberCount, Integer projectCount, String createdAt
    ) {}

    public record MemberRequest(@NotBlank String email, @NotBlank String role) {}

    public record MemberDTO(
        Long id, Long workspaceId, Long userId, String role,
        AuthDTOs.UserDTO user, String joinedAt
    ) {}
}
