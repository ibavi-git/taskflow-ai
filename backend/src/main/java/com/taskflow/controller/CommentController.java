package com.taskflow.controller;

import com.taskflow.dto.CommentDTOs;
import com.taskflow.entity.User;
import com.taskflow.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/tasks/{taskId}/comments")
    public ResponseEntity<List<CommentDTOs.CommentDTO>> list(@PathVariable Long taskId) {
        return ResponseEntity.ok(commentService.list(taskId));
    }

    @PostMapping("/tasks/{taskId}/comments")
    public ResponseEntity<CommentDTOs.CommentDTO> create(
        @PathVariable Long taskId,
        @Valid @RequestBody CommentDTOs.CommentRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.create(taskId, user.getId(), request));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentDTOs.CommentDTO> update(
        @PathVariable Long commentId,
        @Valid @RequestBody CommentDTOs.CommentUpdateRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(commentService.update(commentId, user.getId(), request));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> delete(@PathVariable Long commentId, @AuthenticationPrincipal User user) {
        commentService.delete(commentId, user.getId());
        return ResponseEntity.noContent().build();
    }
}
