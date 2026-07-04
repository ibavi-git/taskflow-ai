package com.taskflow.service;

import com.taskflow.dto.TaskDTOs;
import com.taskflow.entity.Label;
import com.taskflow.entity.Workspace;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.LabelRepository;
import com.taskflow.repository.WorkspaceRepository;
import com.taskflow.util.Mapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LabelService {

    private final LabelRepository labelRepository;
    private final WorkspaceRepository workspaceRepository;

    @Transactional(readOnly = true)
    public List<TaskDTOs.LabelDTO> list(Long workspaceId) {
        return labelRepository.findByWorkspaceId(workspaceId).stream()
            .map(Mapper::toLabelDTO).toList();
    }

    @Transactional
    public TaskDTOs.LabelDTO create(Long workspaceId, String name, String color) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
            .orElseThrow(() -> new ResourceNotFoundException("Workspace", workspaceId));
        Label label = Label.builder().name(name).color(color).workspace(workspace).build();
        labelRepository.save(label);
        return Mapper.toLabelDTO(label);
    }

    @Transactional
    public TaskDTOs.LabelDTO update(Long labelId, String name, String color) {
        Label label = labelRepository.findById(labelId)
            .orElseThrow(() -> new ResourceNotFoundException("Label", labelId));
        if (name != null) label.setName(name);
        if (color != null) label.setColor(color);
        labelRepository.save(label);
        return Mapper.toLabelDTO(label);
    }

    @Transactional
    public void delete(Long labelId) {
        labelRepository.delete(labelRepository.findById(labelId)
            .orElseThrow(() -> new ResourceNotFoundException("Label", labelId)));
    }
}
