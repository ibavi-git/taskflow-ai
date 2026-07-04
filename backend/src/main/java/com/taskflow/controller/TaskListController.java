package com.taskflow.controller;

import com.taskflow.dto.BoardDTOs;
import com.taskflow.entity.User;
import com.taskflow.service.TaskListService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TaskListController {

    private final TaskListService taskListService;

    @GetMapping("/boards/{boardId}/lists")
    public ResponseEntity<List<BoardDTOs.TaskListDTO>> list(
        @PathVariable Long boardId,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(taskListService.list(boardId, user.getId()));
    }

    @PostMapping("/boards/{boardId}/lists")
    public ResponseEntity<BoardDTOs.TaskListDTO> create(
        @PathVariable Long boardId,
        @AuthenticationPrincipal User user,
        @Valid @RequestBody BoardDTOs.TaskListRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(taskListService.create(boardId, user.getId(), request));
    }

    @PutMapping("/lists/{listId}")
    public ResponseEntity<BoardDTOs.TaskListDTO> update(
        @PathVariable Long listId,
        @AuthenticationPrincipal User user,
        @RequestBody BoardDTOs.TaskListUpdateRequest request
    ) {
        return ResponseEntity.ok(taskListService.update(listId, user.getId(), request));
    }

    @DeleteMapping("/lists/{listId}")
    public ResponseEntity<Void> delete(
        @PathVariable Long listId,
        @AuthenticationPrincipal User user
    ) {
        taskListService.delete(listId, user.getId());
        return ResponseEntity.noContent().build();
    }
}
