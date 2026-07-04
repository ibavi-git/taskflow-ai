package com.taskflow.controller;

import com.taskflow.dto.TaskDTOs;
import com.taskflow.entity.User;
import com.taskflow.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/lists/{listId}/tasks")
    public ResponseEntity<List<TaskDTOs.TaskDTO>> list(
        @PathVariable Long listId,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(taskService.list(listId, user.getId()));
    }

    @PostMapping("/lists/{listId}/tasks")
    public ResponseEntity<TaskDTOs.TaskDTO> create(
        @PathVariable Long listId,
        @Valid @RequestBody TaskDTOs.TaskRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(taskService.create(listId, request, user.getId()));
    }

    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<TaskDTOs.TaskDetailDTO> get(
        @PathVariable Long taskId,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(taskService.get(taskId, user.getId()));
    }

    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<TaskDTOs.TaskDTO> update(
        @PathVariable Long taskId,
        @RequestBody TaskDTOs.TaskUpdateRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(taskService.update(taskId, request, user.getId()));
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<Void> delete(
        @PathVariable Long taskId,
        @AuthenticationPrincipal User user
    ) {
        taskService.delete(taskId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/tasks/{taskId}/move")
    public ResponseEntity<TaskDTOs.TaskDTO> move(
        @PathVariable Long taskId,
        @Valid @RequestBody TaskDTOs.TaskMoveRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(taskService.move(taskId, request, user.getId()));
    }

    @GetMapping("/tasks")
    public ResponseEntity<List<TaskDTOs.TaskDTO>> search(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) String priority,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) Long assigneeId,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(taskService.search(q, priority, status, assigneeId, user.getId()));
    }

    @PostMapping("/tasks/{taskId}/labels/{labelId}")
    public ResponseEntity<Map<String, String>> addLabel(
        @PathVariable Long taskId,
        @PathVariable Long labelId,
        @AuthenticationPrincipal User user
    ) {
        taskService.addLabel(taskId, labelId, user.getId());
        return ResponseEntity.ok(Map.of("message", "Label added"));
    }

    @DeleteMapping("/tasks/{taskId}/labels/{labelId}")
    public ResponseEntity<Void> removeLabel(
        @PathVariable Long taskId,
        @PathVariable Long labelId,
        @AuthenticationPrincipal User user
    ) {
        taskService.removeLabel(taskId, labelId, user.getId());
        return ResponseEntity.noContent().build();
    }
}
