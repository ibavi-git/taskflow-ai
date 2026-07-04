package com.taskflow.controller;

import com.taskflow.dto.TaskDTOs;
import com.taskflow.service.LabelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class LabelController {

    private final LabelService labelService;

    @GetMapping("/workspaces/{workspaceId}/labels")
    public ResponseEntity<List<TaskDTOs.LabelDTO>> list(@PathVariable Long workspaceId) {
        return ResponseEntity.ok(labelService.list(workspaceId));
    }

    @PostMapping("/workspaces/{workspaceId}/labels")
    public ResponseEntity<TaskDTOs.LabelDTO> create(
        @PathVariable Long workspaceId,
        @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(labelService.create(workspaceId, body.get("name"), body.get("color")));
    }

    @PutMapping("/labels/{labelId}")
    public ResponseEntity<TaskDTOs.LabelDTO> update(
        @PathVariable Long labelId,
        @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(labelService.update(labelId, body.get("name"), body.get("color")));
    }

    @DeleteMapping("/labels/{labelId}")
    public ResponseEntity<Void> delete(@PathVariable Long labelId) {
        labelService.delete(labelId);
        return ResponseEntity.noContent().build();
    }
}
