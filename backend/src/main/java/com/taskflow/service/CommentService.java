package com.taskflow.service;

import com.taskflow.dto.CommentDTOs;
import com.taskflow.entity.*;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.exception.UnauthorizedException;
import com.taskflow.repository.*;
import com.taskflow.util.Mapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<CommentDTOs.CommentDTO> list(Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId).stream()
            .map(Mapper::toCommentDTO).toList();
    }

    @Transactional
    public CommentDTOs.CommentDTO create(Long taskId, Long authorId, CommentDTOs.CommentRequest req) {
        Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        User author = userRepository.findById(authorId)
            .orElseThrow(() -> new ResourceNotFoundException("User", authorId));
        Comment comment = Comment.builder()
            .content(req.content()).task(task).author(author).build();
        commentRepository.save(comment);

        // Notify task assignee if different from commenter
        if (task.getAssignee() != null && !task.getAssignee().getId().equals(authorId)) {
            notificationService.create(task.getAssignee().getId(), Notification.Type.COMMENT_ADDED,
                author.getName() + " commented on: " + task.getTitle(), taskId);
        }
        return Mapper.toCommentDTO(comment);
    }

    @Transactional
    public CommentDTOs.CommentDTO update(Long commentId, Long userId, CommentDTOs.CommentUpdateRequest req) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new UnauthorizedException("You can only edit your own comments");
        }
        comment.setContent(req.content());
        commentRepository.save(comment);
        return Mapper.toCommentDTO(comment);
    }

    @Transactional
    public void delete(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new UnauthorizedException("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }
}
