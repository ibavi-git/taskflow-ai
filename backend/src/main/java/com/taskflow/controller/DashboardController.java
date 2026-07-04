package com.taskflow.controller;

import com.taskflow.dto.DashboardDTOs;
import com.taskflow.dto.TaskDTOs;
import com.taskflow.entity.User;
import com.taskflow.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardDTOs.DashboardStatsDTO> getStats(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getStats(user.getId()));
    }

    @GetMapping("/activity")
    public ResponseEntity<List<DashboardDTOs.ActivityLogDTO>> getActivity(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getActivity(user.getId()));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<TaskDTOs.TaskDTO>> getUpcoming(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getUpcoming(user.getId()));
    }
}
