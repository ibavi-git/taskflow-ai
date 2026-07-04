package com.taskflow.service;

import com.taskflow.dto.DashboardDTOs;
import com.taskflow.entity.Task;
import com.taskflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TaskRepository taskRepository;
    private final WorkspaceRepository workspaceRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public DashboardDTOs.TaskStatsDTO getTaskStats(Long workspaceId) {
        List<Task> tasks = workspaceId != null ?
            taskRepository.findByWorkspaceId(workspaceId) :
            taskRepository.findAll();

        Map<String, Long> byStatus = tasks.stream()
            .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting()));
        Map<String, Long> byPriority = tasks.stream()
            .collect(Collectors.groupingBy(t -> t.getPriority().name(), Collectors.counting()));
        long overdue = tasks.stream()
            .filter(t -> t.getDueDate() != null &&
                t.getDueDate().isBefore(java.time.LocalDate.now()) &&
                t.getStatus() != Task.Status.DONE)
            .count();
        long completedToday = tasks.stream()
            .filter(t -> t.getStatus() == Task.Status.DONE &&
                t.getUpdatedAt().toLocalDate().equals(java.time.LocalDate.now()))
            .count();

        return new DashboardDTOs.TaskStatsDTO((long) tasks.size(), byStatus, byPriority, overdue, completedToday);
    }

    @Transactional(readOnly = true)
    public List<DashboardDTOs.ProjectProgressDTO> getProjectProgress(Long workspaceId) {
        List<Long> workspaceIds = workspaceId != null ?
            List.of(workspaceId) :
            workspaceRepository.findAll().stream().map(w -> w.getId()).toList();

        return projectRepository.findByWorkspaceIdIn(workspaceIds).stream().map(p -> {
            long total = taskRepository.countByProjectId(p.getId());
            long completed = taskRepository.countCompletedByProjectId(p.getId());
            double percentage = total > 0 ? (completed * 100.0 / total) : 0.0;
            return new DashboardDTOs.ProjectProgressDTO(p.getId(), p.getName(), total, completed,
                Math.round(percentage * 10.0) / 10.0, p.getStatus().name());
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<DashboardDTOs.ProductivityEntryDTO> getProductivity(Long workspaceId, String period) {
        // Returns last 7 days (weekly) or last 4 weeks (monthly) aggregates
        List<DashboardDTOs.ProductivityEntryDTO> result = new ArrayList<>();
        List<Task> tasks = workspaceId != null ?
            taskRepository.findByWorkspaceId(workspaceId) : taskRepository.findAll();
        int count = "monthly".equals(period) ? 4 : 7;
        for (int i = count - 1; i >= 0; i--) {
            java.time.LocalDate date = java.time.LocalDate.now().minusDays("weekly".equals(period) ? i : i * 7L);
            String label = "weekly".equals(period) ?
                date.getDayOfWeek().getDisplayName(java.time.format.TextStyle.SHORT, Locale.ENGLISH) :
                "Week " + (count - i);
            long done = tasks.stream()
                .filter(t -> t.getStatus() == Task.Status.DONE &&
                    t.getUpdatedAt().toLocalDate().equals(date))
                .count();
            long created = tasks.stream()
                .filter(t -> t.getCreatedAt().toLocalDate().equals(date))
                .count();
            result.add(new DashboardDTOs.ProductivityEntryDTO(label, done, created));
        }
        return result;
    }
}
