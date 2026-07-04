package com.taskflow.service;

import com.taskflow.dto.DashboardDTOs;
import com.taskflow.dto.TaskDTOs;
import com.taskflow.repository.*;
import com.taskflow.util.Mapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final WorkspaceRepository workspaceRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final NotificationService notificationService;
    private final ActivityLogRepository activityLogRepository;

    @Transactional(readOnly = true)
    public DashboardDTOs.DashboardStatsDTO getStats(Long userId) {
        List<Long> workspaceIds = workspaceRepository.findAllByUserId(userId)
            .stream().map(w -> w.getId()).toList();
        int totalProjects = workspaceIds.isEmpty() ? 0 :
            (int) workspaceIds.stream().mapToLong(id -> projectRepository.countByWorkspaceId(id)).sum();
        long completed = taskRepository.countCompletedByUser(userId);
        long pending = taskRepository.countPendingByUser(userId);
        long total = completed + pending;
        int todayTasks = taskRepository.findTodayTasksByUser(userId, LocalDate.now()).size();
        long unread = notificationService.countUnread(userId);
        double percentage = total > 0 ? (completed * 100.0 / total) : 0.0;
        return new DashboardDTOs.DashboardStatsDTO(totalProjects, completed, pending,
            todayTasks, unread, Math.round(percentage * 10.0) / 10.0);
    }

    @Transactional(readOnly = true)
    public List<DashboardDTOs.ActivityLogDTO> getActivity(Long userId) {
        return activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 20))
            .stream().map(Mapper::toActivityLogDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<TaskDTOs.TaskDTO> getUpcoming(Long userId) {
        return taskRepository.findUpcomingByUser(userId, LocalDate.now())
            .stream().limit(10).map(Mapper::toTaskDTO).toList();
    }
}
