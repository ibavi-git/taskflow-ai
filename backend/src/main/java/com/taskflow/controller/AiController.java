package com.taskflow.controller;

import com.taskflow.dto.DashboardDTOs;
import com.taskflow.entity.User;
import com.taskflow.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/generate-description")
    public ResponseEntity<DashboardDTOs.AiResponseDTO> generateDescription(
        @RequestBody DashboardDTOs.AiPromptRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(aiService.generate(user.getId(), "GENERATE_DESCRIPTION", request));
    }

    @PostMapping("/generate-subtasks")
    public ResponseEntity<DashboardDTOs.AiResponseDTO> generateSubtasks(
        @RequestBody DashboardDTOs.AiPromptRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(aiService.generate(user.getId(), "GENERATE_SUBTASKS", request));
    }

    @PostMapping("/suggest-priority")
    public ResponseEntity<DashboardDTOs.AiResponseDTO> suggestPriority(
        @RequestBody DashboardDTOs.AiPromptRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(aiService.generate(user.getId(), "SUGGEST_PRIORITY", request));
    }

    @PostMapping("/daily-summary")
    public ResponseEntity<DashboardDTOs.AiResponseDTO> dailySummary(
        @RequestBody DashboardDTOs.AiPromptRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(aiService.generate(user.getId(), "DAILY_SUMMARY", request));
    }

    @PostMapping("/project-health")
    public ResponseEntity<DashboardDTOs.AiResponseDTO> projectHealth(
        @RequestBody DashboardDTOs.AiPromptRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(aiService.generate(user.getId(), "PROJECT_HEALTH", request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<DashboardDTOs.AiHistoryDTO>> getHistory(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(aiService.getHistory(user.getId()));
    }
}
