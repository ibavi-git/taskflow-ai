package com.taskflow.util;

import com.taskflow.dto.*;
import com.taskflow.entity.*;

import java.util.List;

/** Static helpers that convert JPA entities to DTOs. One place, no surprises. */
public class Mapper {

    public static AuthDTOs.UserDTO toUserDTO(User u) {
        if (u == null) return null;
        return new AuthDTOs.UserDTO(u.getId(), u.getName(), u.getEmail(),
            u.getRole().name(), u.getAvatar(), u.getBio(),
            u.getCreatedAt() != null ? u.getCreatedAt().toString() : null);
    }

    public static WorkspaceDTOs.WorkspaceDTO toWorkspaceDTO(Workspace w) {
        return new WorkspaceDTOs.WorkspaceDTO(w.getId(), w.getName(), w.getDescription(), w.getColor(),
            w.getOwner().getId(), w.getMembers().size(), w.getProjects().size(),
            w.getCreatedAt().toString());
    }

    public static WorkspaceDTOs.MemberDTO toMemberDTO(WorkspaceMember m) {
        return new WorkspaceDTOs.MemberDTO(m.getId(), m.getWorkspace().getId(), m.getUser().getId(),
            m.getRole().name(), toUserDTO(m.getUser()), m.getJoinedAt().toString());
    }

    public static ProjectDTOs.ProjectDTO toProjectDTO(Project p, long taskCount, long completedCount) {
        return new ProjectDTOs.ProjectDTO(p.getId(), p.getName(), p.getDescription(), p.getColor(),
            p.getStatus().name(), p.getWorkspace().getId(), p.getBoards().size(),
            taskCount, completedCount, p.getCreatedAt().toString());
    }

    public static BoardDTOs.BoardDTO toBoardDTO(Board b) {
        return new BoardDTOs.BoardDTO(b.getId(), b.getName(), b.getDescription(),
            b.getProject().getId(), b.getCreatedAt().toString());
    }

    public static BoardDTOs.TaskListDTO toListDTO(TaskList l) {
        return new BoardDTOs.TaskListDTO(l.getId(), l.getName(), l.getBoard().getId(),
            l.getPosition(), l.getTasks().size(), l.getCreatedAt().toString());
    }

    public static TaskDTOs.LabelDTO toLabelDTO(Label l) {
        return new TaskDTOs.LabelDTO(l.getId(), l.getName(), l.getColor(), l.getWorkspace().getId());
    }

    public static TaskDTOs.TaskDTO toTaskDTO(Task t) {
        List<TaskDTOs.LabelDTO> labels = t.getLabels().stream().map(Mapper::toLabelDTO).toList();
        return new TaskDTOs.TaskDTO(
            t.getId(), t.getTitle(), t.getDescription(),
            t.getPriority().name(), t.getStatus().name(),
            t.getList().getId(), t.getPosition(),
            t.getDueDate() != null ? t.getDueDate().toString() : null,
            t.getEstimatedHours(), t.getSpentHours(),
            toUserDTO(t.getAssignee()), labels,
            t.getComments().size(), 0,
            t.getCreatedAt().toString(), t.getUpdatedAt().toString()
        );
    }

    public static TaskDTOs.TaskDetailDTO toTaskDetailDTO(Task t) {
        List<TaskDTOs.LabelDTO> labels = t.getLabels().stream().map(Mapper::toLabelDTO).toList();
        List<CommentDTOs.CommentDTO> comments = t.getComments().stream().map(Mapper::toCommentDTO).toList();
        List<TaskDTOs.ChecklistItemDTO> checklist = t.getChecklist().stream()
            .map(c -> new TaskDTOs.ChecklistItemDTO(c.getId(), c.getText(), c.isCompleted())).toList();
        String calEventId = t.getCalendarEvent() != null ? t.getCalendarEvent().getId().toString() : null;
        return new TaskDTOs.TaskDetailDTO(
            t.getId(), t.getTitle(), t.getDescription(),
            t.getPriority().name(), t.getStatus().name(),
            t.getList().getId(), t.getPosition(),
            t.getDueDate() != null ? t.getDueDate().toString() : null,
            t.getEstimatedHours(), t.getSpentHours(),
            toUserDTO(t.getAssignee()), labels, comments, checklist, calEventId,
            t.getCreatedAt().toString(), t.getUpdatedAt().toString()
        );
    }

    public static CommentDTOs.CommentDTO toCommentDTO(Comment c) {
        return new CommentDTOs.CommentDTO(c.getId(), c.getContent(), c.getTask().getId(),
            toUserDTO(c.getAuthor()), c.getCreatedAt().toString(), c.getUpdatedAt().toString());
    }

    public static DashboardDTOs.NotificationDTO toNotificationDTO(Notification n) {
        return new DashboardDTOs.NotificationDTO(n.getId(), n.getType().name(), n.getMessage(),
            n.isRead(), n.getTaskId(), n.getCreatedAt().toString());
    }

    public static DashboardDTOs.ActivityLogDTO toActivityLogDTO(ActivityLog a) {
        return new DashboardDTOs.ActivityLogDTO(a.getId(), a.getAction(), a.getEntityType(),
            a.getEntityName(), toUserDTO(a.getUser()), a.getCreatedAt().toString());
    }

    public static DashboardDTOs.CalendarEventDTO toCalendarEventDTO(CalendarEvent e) {
        return new DashboardDTOs.CalendarEventDTO(
            e.getId(), e.getTitle(), e.getDescription(),
            e.getStartDate().toString(),
            e.getEndDate() != null ? e.getEndDate().toString() : null,
            e.getTask() != null ? e.getTask().getId() : null,
            e.getGoogleEventId(), e.getCreatedAt().toString()
        );
    }

    public static DashboardDTOs.AiHistoryDTO toAiHistoryDTO(AiHistory h) {
        return new DashboardDTOs.AiHistoryDTO(h.getId(), h.getType(), h.getPrompt(),
            h.getResult(), h.getCreatedAt().toString());
    }
}
