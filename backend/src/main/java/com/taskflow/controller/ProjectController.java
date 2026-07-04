package com.taskflow.controller;

import com.taskflow.dto.ProjectDTOs;
import com.taskflow.entity.User;
import com.taskflow.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping("/workspaces/{workspaceId}/projects")
    public ResponseEntity<List<ProjectDTOs.ProjectDTO>> list(
        @PathVariable Long workspaceId,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(projectService.list(workspaceId, user.getId()));
    }

    @PostMapping("/workspaces/{workspaceId}/projects")
    public ResponseEntity<ProjectDTOs.ProjectDTO> create(
        @PathVariable Long workspaceId,
        @AuthenticationPrincipal User user,
        @Valid @RequestBody ProjectDTOs.ProjectRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(projectService.create(workspaceId, user.getId(), request));
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<ProjectDTOs.ProjectDTO> get(
        @PathVariable Long projectId,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(projectService.get(projectId, user.getId()));
    }

    @PutMapping("/projects/{projectId}")
    public ResponseEntity<ProjectDTOs.ProjectDTO> update(
        @PathVariable Long projectId,
        @AuthenticationPrincipal User user,
        @RequestBody ProjectDTOs.ProjectUpdateRequest request
    ) {
        return ResponseEntity.ok(projectService.update(projectId, user.getId(), request));
    }

    @DeleteMapping("/projects/{projectId}")
    public ResponseEntity<Void> delete(
        @PathVariable Long projectId,
        @AuthenticationPrincipal User user
    ) {
        projectService.delete(projectId, user.getId());
        return ResponseEntity.noContent().build();
    }
}
