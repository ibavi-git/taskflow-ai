package com.taskflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class TaskDTOs {

    public record TaskRequest(
        @NotBlank String title,
        String description,
        String priority,
        String dueDate,
        Long assigneeId,
        Double estimatedHours
    ) {}

    public record TaskUpdateRequest(
        String title, String description, String priority, String status,
        String dueDate, Long assigneeId, Double estimatedHours, Double spentHours
    ) {}

    public record TaskMoveRequest(@NotNull Long targetListId, @NotNull Integer position) {}

    public record ChecklistItemDTO(Long id, String text, boolean completed) {}

    public record LabelDTO(Long id, String name, String color, Long workspaceId) {}

    public record TaskDTO(
        Long id, String title, String description, String priority, String status,
        Long listId, Integer position, String dueDate, Double estimatedHours, Double spentHours,
        AuthDTOs.UserDTO assignee, List<LabelDTO> labels,
        Integer commentCount, Integer attachmentCount, String createdAt, String updatedAt
    ) {}

    public record TaskDetailDTO(
        Long id, String title, String description, String priority, String status,
        Long listId, Integer position, String dueDate, Double estimatedHours, Double spentHours,
        AuthDTOs.UserDTO assignee, List<LabelDTO> labels,
        List<CommentDTOs.CommentDTO> comments, List<ChecklistItemDTO> checklist,
        String calendarEventId, String createdAt, String updatedAt
    ) {}
}
