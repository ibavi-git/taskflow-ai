package com.taskflow.service;

import com.taskflow.dto.ProjectDTOs;
import com.taskflow.entity.Project;
import com.taskflow.entity.Workspace;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.*;
import com.taskflow.util.Mapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final WorkspaceRepository workspaceRepository;
    private final TaskRepository taskRepository;
    private final AuthorizationService authz;

    @Transactional(readOnly = true)
    public List<ProjectDTOs.ProjectDTO> list(Long workspaceId, Long userId) {
        Workspace workspace = findWorkspace(workspaceId);
        authz.requireMember(workspace, userId);
        return projectRepository.findByWorkspaceId(workspaceId).stream()
            .map(p -> Mapper.toProjectDTO(p,
                taskRepository.countByProjectId(p.getId()),
                taskRepository.countCompletedByProjectId(p.getId())))
            .toList();
    }

    @Transactional
    public ProjectDTOs.ProjectDTO create(Long workspaceId, Long userId, ProjectDTOs.ProjectRequest req) {
        Workspace workspace = findWorkspace(workspaceId);
        authz.requireMember(workspace, userId);
        Project project = Project.builder()
            .name(req.name()).description(req.description()).color(req.color())
            .workspace(workspace).build();
        projectRepository.save(project);
        return Mapper.toProjectDTO(project, 0L, 0L);
    }

    @Transactional(readOnly = true)
    public ProjectDTOs.ProjectDTO get(Long projectId, Long userId) {
        Project p = findById(projectId);
        authz.requireMemberForProject(p, userId);
        return Mapper.toProjectDTO(p,
            taskRepository.countByProjectId(p.getId()),
            taskRepository.countCompletedByProjectId(p.getId()));
    }

    @Transactional
    public ProjectDTOs.ProjectDTO update(Long projectId, Long userId, ProjectDTOs.ProjectUpdateRequest req) {
        Project p = findById(projectId);
        authz.requireMemberForProject(p, userId);
        if (req.name() != null) p.setName(req.name());
        if (req.description() != null) p.setDescription(req.description());
        if (req.color() != null) p.setColor(req.color());
        if (req.status() != null) p.setStatus(Project.Status.valueOf(req.status()));
        projectRepository.save(p);
        return Mapper.toProjectDTO(p,
            taskRepository.countByProjectId(p.getId()),
            taskRepository.countCompletedByProjectId(p.getId()));
    }

    @Transactional
    public void delete(Long projectId, Long userId) {
        Project p = findById(projectId);
        authz.requireAdmin(p.getWorkspace(), userId);
        projectRepository.delete(p);
    }

    private Project findById(Long id) {
        return projectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Project", id));
    }

    private Workspace findWorkspace(Long id) {
        return workspaceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Workspace", id));
    }
}
