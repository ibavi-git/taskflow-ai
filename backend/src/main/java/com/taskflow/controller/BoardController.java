package com.taskflow.controller;

import com.taskflow.dto.BoardDTOs;
import com.taskflow.entity.User;
import com.taskflow.service.BoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @GetMapping("/projects/{projectId}/boards")
    public ResponseEntity<List<BoardDTOs.BoardDTO>> list(
        @PathVariable Long projectId,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(boardService.list(projectId, user.getId()));
    }

    @PostMapping("/projects/{projectId}/boards")
    public ResponseEntity<BoardDTOs.BoardDTO> create(
        @PathVariable Long projectId,
        @AuthenticationPrincipal User user,
        @Valid @RequestBody BoardDTOs.BoardRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(boardService.create(projectId, user.getId(), request));
    }

    @GetMapping("/boards/{boardId}")
    public ResponseEntity<BoardDTOs.BoardDetailDTO> get(
        @PathVariable Long boardId,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(boardService.getDetail(boardId, user.getId()));
    }

    @PutMapping("/boards/{boardId}")
    public ResponseEntity<BoardDTOs.BoardDTO> update(
        @PathVariable Long boardId,
        @AuthenticationPrincipal User user,
        @RequestBody BoardDTOs.BoardUpdateRequest request
    ) {
        return ResponseEntity.ok(boardService.update(boardId, user.getId(), request));
    }

    @DeleteMapping("/boards/{boardId}")
    public ResponseEntity<Void> delete(
        @PathVariable Long boardId,
        @AuthenticationPrincipal User user
    ) {
        boardService.delete(boardId, user.getId());
        return ResponseEntity.noContent().build();
    }
}
