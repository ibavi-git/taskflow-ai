package com.taskflow.dto;

import jakarta.validation.constraints.NotBlank;

public class ProjectDTOs {

    public record ProjectRequest(
        @NotBlank String name,
        String description,
        String color
    ) {}

    public record ProjectUpdateRequest(String name, String description, String color, String status) {}

    public record ProjectDTO(
        Long id, String name, String description, String color, String status,
        Long workspaceId, Integer boardCount, Long taskCount, Long completedTaskCount, String createdAt
    ) {}
}
