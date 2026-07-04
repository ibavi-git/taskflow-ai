package com.taskflow.service;

import com.taskflow.entity.*;
import com.taskflow.exception.UnauthorizedException;
import com.taskflow.repository.WorkspaceMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Centralised ownership / membership checks so no controller or service
 * silently skips authorisation. Every method throws {@link UnauthorizedException}
 * when the caller does not have the required access level.
 */
@Service
@RequiredArgsConstructor
public class AuthorizationService {

    private final WorkspaceMemberRepository memberRepository;

    // -----------------------------------------------------------------------
    // Core predicates
    // -----------------------------------------------------------------------

    private boolean isOwnerOrMember(Workspace workspace, Long userId) {
        if (workspace.getOwner().getId().equals(userId)) return true;
        return memberRepository.existsByWorkspaceIdAndUserId(workspace.getId(), userId);
    }

    private boolean isOwnerOrAdmin(Workspace workspace, Long userId) {
        if (workspace.getOwner().getId().equals(userId)) return true;
        return memberRepository.findByWorkspaceIdAndUserId(workspace.getId(), userId)
            .map(m -> m.getRole() == User.Role.ADMIN)
            .orElse(false);
    }

    // -----------------------------------------------------------------------
    // Workspace-level checks
    // -----------------------------------------------------------------------

    @Transactional(readOnly = true)
    public void requireMember(Workspace workspace, Long userId) {
        if (!isOwnerOrMember(workspace, userId)) {
            throw new UnauthorizedException("You are not a member of this workspace");
        }
    }

    @Transactional(readOnly = true)
    public void requireAdmin(Workspace workspace, Long userId) {
        if (!isOwnerOrAdmin(workspace, userId)) {
            throw new UnauthorizedException("Admin access required for this workspace");
        }
    }

    // -----------------------------------------------------------------------
    // Resource-traversal helpers (load workspace from child resource)
    // -----------------------------------------------------------------------

    @Transactional(readOnly = true)
    public void requireMemberForProject(Project project, Long userId) {
        requireMember(project.getWorkspace(), userId);
    }

    @Transactional(readOnly = true)
    public void requireMemberForBoard(Board board, Long userId) {
        requireMember(board.getProject().getWorkspace(), userId);
    }

    @Transactional(readOnly = true)
    public void requireMemberForList(TaskList list, Long userId) {
        requireMember(list.getBoard().getProject().getWorkspace(), userId);
    }

    @Transactional(readOnly = true)
    public void requireMemberForTask(Task task, Long userId) {
        requireMember(task.getList().getBoard().getProject().getWorkspace(), userId);
    }
}
