package com.taskflow.repository;

import com.taskflow.entity.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    List<CalendarEvent> findByUserIdOrderByStartDateAsc(Long userId);
    java.util.Optional<CalendarEvent> findByTaskId(Long taskId);
}
