package com.taskflow.repository;

import com.taskflow.entity.AiHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AiHistoryRepository extends JpaRepository<AiHistory, Long> {
    List<AiHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
}
