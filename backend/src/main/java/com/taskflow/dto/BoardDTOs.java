package com.taskflow.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class BoardDTOs {

    public record BoardRequest(@NotBlank String name, String description) {}

    public record BoardUpdateRequest(String name, String description) {}

    public record BoardDTO(Long id, String name, String description, Long projectId, String createdAt) {}

    public record BoardDetailDTO(
        Long id, String name, String description, Long projectId,
        List<TaskListWithTasksDTO> lists, String createdAt
    ) {}

    public record TaskListDTO(Long id, String name, Long boardId, Integer position, Integer taskCount, String createdAt) {}

    public record TaskListWithTasksDTO(
        Long id, String name, Long boardId, Integer position,
        List<TaskDTOs.TaskDTO> tasks, String createdAt
    ) {}

    public record TaskListRequest(@NotBlank String name, Integer position) {}

    public record TaskListUpdateRequest(String name, Integer position) {}
}
