package com.taskflow.repository;

import com.taskflow.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByWorkspaceId(Long workspaceId);
    List<Project> findByWorkspaceIdIn(List<Long> workspaceIds);
    long countByWorkspaceId(Long workspaceId);
}
