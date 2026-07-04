package com.taskflow.dto;

import jakarta.validation.constraints.NotBlank;

public class CommentDTOs {

    public record CommentRequest(@NotBlank String content) {}

    public record CommentUpdateRequest(@NotBlank String content) {}

    public record CommentDTO(
        Long id, String content, Long taskId,
        AuthDTOs.UserDTO author, String createdAt, String updatedAt
    ) {}
}
