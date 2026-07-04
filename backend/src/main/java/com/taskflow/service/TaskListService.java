package com.taskflow.service;

import com.taskflow.dto.BoardDTOs;
import com.taskflow.entity.Board;
import com.taskflow.entity.TaskList;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.BoardRepository;
import com.taskflow.repository.TaskListRepository;
import com.taskflow.util.Mapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskListService {

    private final TaskListRepository listRepository;
    private final BoardRepository boardRepository;
    private final AuthorizationService authz;

    @Transactional(readOnly = true)
    public List<BoardDTOs.TaskListDTO> list(Long boardId, Long userId) {
        Board board = findBoard(boardId);
        authz.requireMemberForBoard(board, userId);
        return listRepository.findByBoardIdOrderByPositionAsc(boardId).stream()
            .map(Mapper::toListDTO).toList();
    }

    @Transactional
    public BoardDTOs.TaskListDTO create(Long boardId, Long userId, BoardDTOs.TaskListRequest req) {
        Board board = findBoard(boardId);
        authz.requireMemberForBoard(board, userId);
        int position = req.position() != null ? req.position() : listRepository.countByBoardId(boardId);
        TaskList list = TaskList.builder()
            .name(req.name()).position(position).board(board).build();
        listRepository.save(list);
        return Mapper.toListDTO(list);
    }

    @Transactional
    public BoardDTOs.TaskListDTO update(Long listId, Long userId, BoardDTOs.TaskListUpdateRequest req) {
        TaskList list = findById(listId);
        authz.requireMemberForList(list, userId);
        if (req.name() != null) list.setName(req.name());
        if (req.position() != null) list.setPosition(req.position());
        listRepository.save(list);
        return Mapper.toListDTO(list);
    }

    @Transactional
    public void delete(Long listId, Long userId) {
        TaskList list = findById(listId);
        authz.requireMemberForList(list, userId);
        listRepository.delete(list);
    }

    private TaskList findById(Long id) {
        return listRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("List", id));
    }

    private Board findBoard(Long id) {
        return boardRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Board", id));
    }
}
