package com.taskflow.controller;

import com.taskflow.dto.DashboardDTOs;
import com.taskflow.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/task-stats")
    public ResponseEntity<DashboardDTOs.TaskStatsDTO> getTaskStats(
        @RequestParam(required = false) Long workspaceId
    ) {
        return ResponseEntity.ok(reportService.getTaskStats(workspaceId));
    }

    @GetMapping("/project-progress")
    public ResponseEntity<List<DashboardDTOs.ProjectProgressDTO>> getProjectProgress(
        @RequestParam(required = false) Long workspaceId
    ) {
        return ResponseEntity.ok(reportService.getProjectProgress(workspaceId));
    }

    @GetMapping("/productivity")
    public ResponseEntity<List<DashboardDTOs.ProductivityEntryDTO>> getProductivity(
        @RequestParam(required = false) Long workspaceId,
        @RequestParam(defaultValue = "weekly") String period
    ) {
        return ResponseEntity.ok(reportService.getProductivity(workspaceId, period));
    }
}
