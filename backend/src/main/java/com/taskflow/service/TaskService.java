package com.taskflow.service;

import com.taskflow.dto.TaskDTOs;
import com.taskflow.entity.*;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.*;
import com.taskflow.util.Mapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskListRepository listRepository;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;
    private final NotificationService notificationService;
    private final AuthorizationService authz;

    @Transactional(readOnly = true)
    public List<TaskDTOs.TaskDTO> list(Long listId, Long userId) {
        TaskList list = findList(listId);
        authz.requireMemberForList(list, userId);
        return taskRepository.findByListIdOrderByPositionAsc(listId).stream()
            .map(Mapper::toTaskDTO).toList();
    }

    @Transactional
    public TaskDTOs.TaskDTO create(Long listId, TaskDTOs.TaskRequest req, Long creatorId) {
        TaskList list = findList(listId);
        authz.requireMemberForList(list, creatorId);
        Task task = Task.builder()
            .title(req.title()).description(req.description()).list(list).build();
        if (req.priority() != null) task.setPriority(Task.Priority.valueOf(req.priority()));
        if (req.dueDate() != null) task.setDueDate(LocalDate.parse(req.dueDate()));
        if (req.estimatedHours() != null) task.setEstimatedHours(req.estimatedHours());
        if (req.assigneeId() != null) {
            User assignee = userRepository.findById(req.assigneeId())
                .orElseThrow(() -> new ResourceNotFoundException("User", req.assigneeId()));
            task.setAssignee(assignee);
            if (!assignee.getId().equals(creatorId)) {
                notificationService.create(assignee.getId(), Notification.Type.TASK_ASSIGNED,
                    "You have been assigned to task: " + task.getTitle(), null);
            }
        }
        taskRepository.save(task);
        return Mapper.toTaskDTO(task);
    }

    @Transactional(readOnly = true)
    public TaskDTOs.TaskDetailDTO get(Long taskId, Long userId) {
        Task task = findById(taskId);
        authz.requireMemberForTask(task, userId);
        return Mapper.toTaskDetailDTO(task);
    }

    @Transactional
    public TaskDTOs.TaskDTO update(Long taskId, TaskDTOs.TaskUpdateRequest req, Long userId) {
        Task task = findById(taskId);
        authz.requireMemberForTask(task, userId);
        if (req.title() != null) task.setTitle(req.title());
        if (req.description() != null) task.setDescription(req.description());
        if (req.priority() != null) task.setPriority(Task.Priority.valueOf(req.priority()));
        if (req.status() != null) {
            task.setStatus(Task.Status.valueOf(req.status()));
            if (task.getStatus() == Task.Status.DONE && task.getAssignee() != null) {
                notificationService.create(task.getAssignee().getId(), Notification.Type.TASK_COMPLETED,
                    "Task completed: " + task.getTitle(), task.getId());
            }
        }
        if (req.dueDate() != null) task.setDueDate(LocalDate.parse(req.dueDate()));
        if (req.estimatedHours() != null) task.setEstimatedHours(req.estimatedHours());
        if (req.spentHours() != null) task.setSpentHours(req.spentHours());
        if (req.assigneeId() != null) {
            User assignee = userRepository.findById(req.assigneeId())
                .orElseThrow(() -> new ResourceNotFoundException("User", req.assigneeId()));
            task.setAssignee(assignee);
        }
        taskRepository.save(task);
        return Mapper.toTaskDTO(task);
    }

    @Transactional
    public void delete(Long taskId, Long userId) {
        Task task = findById(taskId);
        authz.requireMemberForTask(task, userId);
        taskRepository.delete(task);
    }

    @Transactional
    public TaskDTOs.TaskDTO move(Long taskId, TaskDTOs.TaskMoveRequest req, Long userId) {
        Task task = findById(taskId);
        authz.requireMemberForTask(task, userId);
        TaskList targetList = listRepository.findById(req.targetListId())
            .orElseThrow(() -> new ResourceNotFoundException("List", req.targetListId()));
        // Target list must be in the same board
        authz.requireMemberForList(targetList, userId);
        task.setList(targetList);
        task.setPosition(req.position());
        taskRepository.save(task);
        return Mapper.toTaskDTO(task);
    }

    @Transactional(readOnly = true)
    public List<TaskDTOs.TaskDTO> search(String q, String priority, String status, Long assigneeId, Long userId) {
        Task.Priority p = priority != null ? Task.Priority.valueOf(priority) : null;
        Task.Status s = status != null ? Task.Status.valueOf(status) : null;
        return taskRepository.searchTasks(q, p, s, assigneeId).stream()
            // Only return tasks in workspaces the user belongs to
            .filter(t -> {
                try {
                    authz.requireMemberForTask(t, userId);
                    return true;
                } catch (Exception e) {
                    return false;
                }
            })
            .map(Mapper::toTaskDTO).toList();
    }

    @Transactional
    public void addLabel(Long taskId, Long labelId, Long userId) {
        Task task = findById(taskId);
        authz.requireMemberForTask(task, userId);
        Label label = labelRepository.findById(labelId)
            .orElseThrow(() -> new ResourceNotFoundException("Label", labelId));
        if (!task.getLabels().contains(label)) {
            task.getLabels().add(label);
            taskRepository.save(task);
        }
    }

    @Transactional
    public void removeLabel(Long taskId, Long labelId, Long userId) {
        Task task = findById(taskId);
        authz.requireMemberForTask(task, userId);
        task.getLabels().removeIf(l -> l.getId().equals(labelId));
        taskRepository.save(task);
    }

    private Task findById(Long id) {
        return taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task", id));
    }

    private TaskList findList(Long id) {
        return listRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("List", id));
    }
}
