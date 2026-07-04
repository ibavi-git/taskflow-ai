package com.taskflow.repository;

import com.taskflow.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByListIdOrderByPositionAsc(Long listId);

    @Query("SELECT t FROM Task t WHERE t.assignee.id = :userId AND t.dueDate = :today")
    List<Task> findTodayTasksByUser(Long userId, LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.assignee.id = :userId AND t.dueDate > :today AND t.status != 'DONE' ORDER BY t.dueDate ASC")
    List<Task> findUpcomingByUser(Long userId, LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.list.board.project.workspace.id = :workspaceId")
    List<Task> findByWorkspaceId(Long workspaceId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee.id = :userId AND t.status = 'DONE'")
    long countCompletedByUser(Long userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignee.id = :userId AND t.status != 'DONE'")
    long countPendingByUser(Long userId);

    @Query("SELECT t FROM Task t WHERE " +
           "(:q IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:assigneeId IS NULL OR t.assignee.id = :assigneeId)")
    List<Task> searchTasks(String q, Task.Priority priority, Task.Status status, Long assigneeId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.list.board.project.id = :projectId")
    long countByProjectId(Long projectId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.list.board.project.id = :projectId AND t.status = 'DONE'")
    long countCompletedByProjectId(Long projectId);
}
