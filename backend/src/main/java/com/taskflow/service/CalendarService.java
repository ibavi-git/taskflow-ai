package com.taskflow.service;

import com.taskflow.dto.DashboardDTOs;
import com.taskflow.entity.*;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.*;
import com.taskflow.util.Mapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final CalendarEventRepository calendarEventRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<DashboardDTOs.CalendarEventDTO> list(Long userId) {
        return calendarEventRepository.findByUserIdOrderByStartDateAsc(userId).stream()
            .map(Mapper::toCalendarEventDTO).toList();
    }

    @Transactional
    public DashboardDTOs.CalendarEventDTO create(Long userId, DashboardDTOs.CalendarEventRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        CalendarEvent event = CalendarEvent.builder()
            .title(req.title()).description(req.description())
            .startDate(LocalDateTime.parse(req.startDate()))
            .user(user).build();
        if (req.endDate() != null) event.setEndDate(LocalDateTime.parse(req.endDate()));
        if (req.taskId() != null) {
            taskRepository.findById(req.taskId()).ifPresent(event::setTask);
        }
        calendarEventRepository.save(event);
        return Mapper.toCalendarEventDTO(event);
    }

    @Transactional
    public DashboardDTOs.CalendarEventDTO update(Long eventId, DashboardDTOs.CalendarEventUpdateRequest req) {
        CalendarEvent event = calendarEventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("CalendarEvent", eventId));
        if (req.title() != null) event.setTitle(req.title());
        if (req.description() != null) event.setDescription(req.description());
        if (req.startDate() != null) event.setStartDate(LocalDateTime.parse(req.startDate()));
        if (req.endDate() != null) event.setEndDate(LocalDateTime.parse(req.endDate()));
        calendarEventRepository.save(event);
        return Mapper.toCalendarEventDTO(event);
    }

    @Transactional
    public void delete(Long eventId) {
        calendarEventRepository.delete(calendarEventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("CalendarEvent", eventId)));
    }

    @Transactional
    public DashboardDTOs.CalendarEventDTO syncTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Return existing event if already synced
        return calendarEventRepository.findByTaskId(taskId)
            .map(Mapper::toCalendarEventDTO)
            .orElseGet(() -> {
                LocalDateTime startDate = task.getDueDate() != null ?
                    task.getDueDate().atTime(9, 0) : LocalDateTime.now().plusDays(1);
                CalendarEvent event = CalendarEvent.builder()
                    .title(task.getTitle()).description(task.getDescription())
                    .startDate(startDate).task(task).user(user).build();
                calendarEventRepository.save(event);
                return Mapper.toCalendarEventDTO(event);
            });
    }
}
