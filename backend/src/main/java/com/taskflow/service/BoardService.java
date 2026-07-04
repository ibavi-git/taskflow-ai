package com.taskflow.service;

import com.taskflow.dto.BoardDTOs;
import com.taskflow.dto.TaskDTOs;
import com.taskflow.entity.Board;
import com.taskflow.entity.Project;
import com.taskflow.entity.TaskList;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.BoardRepository;
import com.taskflow.repository.ProjectRepository;
import com.taskflow.util.Mapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final ProjectRepository projectRepository;
    private final AuthorizationService authz;

    @Transactional(readOnly = true)
    public List<BoardDTOs.BoardDTO> list(Long projectId, Long userId) {
        Project project = findProject(projectId);
        authz.requireMemberForProject(project, userId);
        return boardRepository.findByProjectId(projectId).stream().map(Mapper::toBoardDTO).toList();
    }

    @Transactional
    public BoardDTOs.BoardDTO create(Long projectId, Long userId, BoardDTOs.BoardRequest req) {
        Project project = findProject(projectId);
        authz.requireMemberForProject(project, userId);
        Board board = Board.builder()
            .name(req.name()).description(req.description()).project(project).build();

        // Create default Kanban columns
        String[] defaultLists = {"Backlog", "To Do", "In Progress", "Testing", "Done"};
        for (int i = 0; i < defaultLists.length; i++) {
            TaskList list = TaskList.builder()
                .name(defaultLists[i]).position(i).board(board).build();
            board.getLists().add(list);
        }
        boardRepository.save(board);
        return Mapper.toBoardDTO(board);
    }

    @Transactional(readOnly = true)
    public BoardDTOs.BoardDetailDTO getDetail(Long boardId, Long userId) {
        Board board = findById(boardId);
        authz.requireMemberForBoard(board, userId);
        List<BoardDTOs.TaskListWithTasksDTO> lists = board.getLists().stream()
            .map(l -> {
                List<TaskDTOs.TaskDTO> tasks = l.getTasks().stream().map(Mapper::toTaskDTO).toList();
                return new BoardDTOs.TaskListWithTasksDTO(l.getId(), l.getName(),
                    l.getBoard().getId(), l.getPosition(), tasks, l.getCreatedAt().toString());
            }).toList();
        return new BoardDTOs.BoardDetailDTO(board.getId(), board.getName(), board.getDescription(),
            board.getProject().getId(), lists, board.getCreatedAt().toString());
    }

    @Transactional
    public BoardDTOs.BoardDTO update(Long boardId, Long userId, BoardDTOs.BoardUpdateRequest req) {
        Board board = findById(boardId);
        authz.requireMemberForBoard(board, userId);
        if (req.name() != null) board.setName(req.name());
        if (req.description() != null) board.setDescription(req.description());
        boardRepository.save(board);
        return Mapper.toBoardDTO(board);
    }

    @Transactional
    public void delete(Long boardId, Long userId) {
        Board board = findById(boardId);
        authz.requireAdmin(board.getProject().getWorkspace(), userId);
        boardRepository.delete(board);
    }

    private Board findById(Long id) {
        return boardRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Board", id));
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Project", id));
    }
}
