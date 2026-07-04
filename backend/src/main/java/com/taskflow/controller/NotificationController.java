package com.taskflow.controller;

import com.taskflow.dto.DashboardDTOs;
import com.taskflow.entity.User;
import com.taskflow.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<DashboardDTOs.NotificationDTO>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.list(user.getId()));
    }

    @PatchMapping
    public ResponseEntity<Map<String, String>> markAllRead(@AuthenticationPrincipal User user) {
        notificationService.markAllRead(user.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @PatchMapping("/{notificationId}")
    public ResponseEntity<DashboardDTOs.NotificationDTO> markRead(@PathVariable Long notificationId) {
        return ResponseEntity.ok(notificationService.markRead(notificationId));
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> delete(@PathVariable Long notificationId) {
        notificationService.delete(notificationId);
        return ResponseEntity.noContent().build();
    }
}
