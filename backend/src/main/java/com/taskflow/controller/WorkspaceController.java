package com.taskflow.controller;

import com.taskflow.dto.WorkspaceDTOs;
import com.taskflow.entity.User;
import com.taskflow.service.WorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @GetMapping
    public ResponseEntity<List<WorkspaceDTOs.WorkspaceDTO>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(workspaceService.listForUser(user.getId()));
    }

    @PostMapping
    public ResponseEntity<WorkspaceDTOs.WorkspaceDTO> create(
        @AuthenticationPrincipal User user,
        @Valid @RequestBody WorkspaceDTOs.WorkspaceRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workspaceService.create(user.getId(), request));
    }

    @GetMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceDTOs.WorkspaceDTO> get(@PathVariable Long workspaceId) {
        return ResponseEntity.ok(workspaceService.get(workspaceId));
    }

    @PutMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceDTOs.WorkspaceDTO> update(
        @PathVariable Long workspaceId,
        @AuthenticationPrincipal User user,
        @RequestBody WorkspaceDTOs.WorkspaceUpdateRequest request
    ) {
        return ResponseEntity.ok(workspaceService.update(workspaceId, user.getId(), request));
    }

    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<Void> delete(@PathVariable Long workspaceId, @AuthenticationPrincipal User user) {
        workspaceService.delete(workspaceId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{workspaceId}/members")
    public ResponseEntity<List<WorkspaceDTOs.MemberDTO>> listMembers(@PathVariable Long workspaceId) {
        return ResponseEntity.ok(workspaceService.listMembers(workspaceId));
    }

    @PostMapping("/{workspaceId}/members")
    public ResponseEntity<WorkspaceDTOs.MemberDTO> addMember(
        @PathVariable Long workspaceId,
        @AuthenticationPrincipal User user,
        @Valid @RequestBody WorkspaceDTOs.MemberRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workspaceService.addMember(workspaceId, user.getId(), request));
    }

    @DeleteMapping("/{workspaceId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
        @PathVariable Long workspaceId,
        @PathVariable Long userId,
        @AuthenticationPrincipal User admin
    ) {
        workspaceService.removeMember(workspaceId, userId, admin.getId());
        return ResponseEntity.noContent().build();
    }
}
