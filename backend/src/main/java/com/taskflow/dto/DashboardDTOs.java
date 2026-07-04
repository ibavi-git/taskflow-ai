package com.taskflow.dto;

import java.util.List;
import java.util.Map;

public class DashboardDTOs {

    public record DashboardStatsDTO(
        Integer totalProjects,
        Long completedTasks,
        Long pendingTasks,
        Integer todayTasks,
        Long unreadNotifications,
        Double completionPercentage
    ) {}

    public record ActivityLogDTO(
        Long id, String action, String entityType, String entityName,
        AuthDTOs.UserDTO user, String createdAt
    ) {}

    public record TaskStatsDTO(
        Long total,
        Map<String, Long> byStatus,
        Map<String, Long> byPriority,
        Long overdue,
        Long completedToday
    ) {}

    public record ProjectProgressDTO(
        Long projectId, String projectName, Long total, Long completed,
        Double percentage, String status
    ) {}

    public record ProductivityEntryDTO(String label, Long completed, Long created) {}

    public record NotificationDTO(
        Long id, String type, String message, boolean read, Long taskId, String createdAt
    ) {}

    public record AiPromptRequest(String prompt, Long taskId, Long projectId) {}

    public record AiResponseDTO(String result, String type, Integer tokenUsage) {}

    public record AiHistoryDTO(Long id, String type, String prompt, String result, String createdAt) {}

    public record CalendarEventDTO(
        Long id, String title, String description, String startDate, String endDate,
        Long taskId, String googleEventId, String createdAt
    ) {}

    public record CalendarEventRequest(String title, String description, String startDate, String endDate, Long taskId) {}

    public record CalendarEventUpdateRequest(String title, String description, String startDate, String endDate) {}

    public record SearchResultsDTO(
        List<TaskDTOs.TaskDTO> tasks,
        List<ProjectDTOs.ProjectDTO> projects,
        List<AuthDTOs.UserDTO> users
    ) {}
}
