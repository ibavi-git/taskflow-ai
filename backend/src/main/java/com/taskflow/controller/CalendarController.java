package com.taskflow.controller;

import com.taskflow.dto.DashboardDTOs;
import com.taskflow.entity.User;
import com.taskflow.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/calendar/events")
    public ResponseEntity<List<DashboardDTOs.CalendarEventDTO>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(calendarService.list(user.getId()));
    }

    @PostMapping("/calendar/events")
    public ResponseEntity<DashboardDTOs.CalendarEventDTO> create(
        @RequestBody DashboardDTOs.CalendarEventRequest request,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(calendarService.create(user.getId(), request));
    }

    @PutMapping("/calendar/events/{eventId}")
    public ResponseEntity<DashboardDTOs.CalendarEventDTO> update(
        @PathVariable Long eventId,
        @RequestBody DashboardDTOs.CalendarEventUpdateRequest request
    ) {
        return ResponseEntity.ok(calendarService.update(eventId, request));
    }

    @DeleteMapping("/calendar/events/{eventId}")
    public ResponseEntity<Void> delete(@PathVariable Long eventId) {
        calendarService.delete(eventId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/tasks/{taskId}/sync-calendar")
    public ResponseEntity<DashboardDTOs.CalendarEventDTO> syncTask(
        @PathVariable Long taskId,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(calendarService.syncTask(taskId, user.getId()));
    }
}
