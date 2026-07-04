package com.taskflow.repository;

import com.taskflow.entity.TaskList;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskListRepository extends JpaRepository<TaskList, Long> {
    List<TaskList> findByBoardIdOrderByPositionAsc(Long boardId);
    int countByBoardId(Long boardId);
}
