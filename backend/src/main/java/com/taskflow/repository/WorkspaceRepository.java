package com.taskflow.repository;

import com.taskflow.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    @Query("SELECT w FROM Workspace w WHERE w.owner.id = :userId OR EXISTS (SELECT m FROM WorkspaceMember m WHERE m.workspace = w AND m.user.id = :userId)")
    List<Workspace> findAllByUserId(Long userId);
}
