package com.taskflow.service;

import com.taskflow.dto.AuthDTOs;
import com.taskflow.dto.DashboardDTOs;
import com.taskflow.dto.ProjectDTOs;
import com.taskflow.dto.TaskDTOs;
import com.taskflow.repository.*;
import com.taskflow.util.Mapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardDTOs.SearchResultsDTO search(String query) {
        String q = query != null ? query.toLowerCase() : "";

        List<TaskDTOs.TaskDTO> tasks = taskRepository.searchTasks(q, null, null, null)
            .stream().limit(10).map(Mapper::toTaskDTO).toList();

        List<ProjectDTOs.ProjectDTO> projects = projectRepository.findAll().stream()
            .filter(p -> p.getName().toLowerCase().contains(q))
            .limit(5).map(p -> Mapper.toProjectDTO(p, 0L, 0L)).toList();

        List<AuthDTOs.UserDTO> users = userRepository.findAll().stream()
            .filter(u -> u.getName().toLowerCase().contains(q) || u.getEmail().toLowerCase().contains(q))
            .limit(5).map(Mapper::toUserDTO).toList();

        return new DashboardDTOs.SearchResultsDTO(tasks, projects, users);
    }
}
