package com.taskflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDTOs {

    public record RegisterRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8) String password
    ) {}

    public record LoginRequest(
        @NotBlank String email,
        @NotBlank String password
    ) {}

    public record ForgotPasswordRequest(@NotBlank @Email String email) {}

    public record ResetPasswordRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 8) String password
    ) {}

    public record ProfileUpdateRequest(String name, String avatar, String bio) {}

    public record AuthResponse(String token, UserDTO user) {}

    public record UserDTO(
        Long id, String name, String email, String role,
        String avatar, String bio, String createdAt
    ) {}
}
