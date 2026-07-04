package com.taskflow.service;

import com.taskflow.dto.WorkspaceDTOs;
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
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<WorkspaceDTOs.WorkspaceDTO> listForUser(Long userId) {
        return workspaceRepository.findAllByUserId(userId)
            .stream().map(Mapper::toWorkspaceDTO).toList();
    }

    @Transactional
    public WorkspaceDTOs.WorkspaceDTO create(Long ownerId, WorkspaceDTOs.WorkspaceRequest req) {
        User owner = userRepository.findById(ownerId)
            .orElseThrow(() -> new ResourceNotFoundException("User", ownerId));
        Workspace workspace = Workspace.builder()
            .name(req.name()).description(req.description()).color(req.color())
            .owner(owner).build();
        workspaceRepository.save(workspace);

        // Add owner as ADMIN member
        WorkspaceMember member = WorkspaceMember.builder()
            .workspace(workspace).user(owner).role(User.Role.ADMIN).build();
        memberRepository.save(member);
        workspace.getMembers().add(member);

        return Mapper.toWorkspaceDTO(workspace);
    }

    @Transactional(readOnly = true)
    public WorkspaceDTOs.WorkspaceDTO get(Long workspaceId) {
        return Mapper.toWorkspaceDTO(findById(workspaceId));
    }

    @Transactional
    public WorkspaceDTOs.WorkspaceDTO update(Long workspaceId, Long userId, WorkspaceDTOs.WorkspaceUpdateRequest req) {
        Workspace w = findById(workspaceId);
        checkAdminAccess(w, userId);
        if (req.name() != null) w.setName(req.name());
        if (req.description() != null) w.setDescription(req.description());
        if (req.color() != null) w.setColor(req.color());
        workspaceRepository.save(w);
        return Mapper.toWorkspaceDTO(w);
    }

    @Transactional
    public void delete(Long workspaceId, Long userId) {
        Workspace w = findById(workspaceId);
        checkAdminAccess(w, userId);
        workspaceRepository.delete(w);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceDTOs.MemberDTO> listMembers(Long workspaceId) {
        Workspace w = findById(workspaceId);
        return memberRepository.findByWorkspace(w).stream().map(Mapper::toMemberDTO).toList();
    }

    @Transactional
    public WorkspaceDTOs.MemberDTO addMember(Long workspaceId, Long adminId, WorkspaceDTOs.MemberRequest req) {
        Workspace w = findById(workspaceId);
        checkAdminAccess(w, adminId);
        User user = userRepository.findByEmail(req.email())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + req.email()));
        if (memberRepository.existsByWorkspaceIdAndUserId(workspaceId, user.getId())) {
            throw new IllegalArgumentException("User is already a member");
        }
        WorkspaceMember member = WorkspaceMember.builder()
            .workspace(w).user(user).role(User.Role.valueOf(req.role())).build();
        memberRepository.save(member);
        return Mapper.toMemberDTO(member);
    }

    @Transactional
    public void removeMember(Long workspaceId, Long targetUserId, Long adminId) {
        Workspace w = findById(workspaceId);
        checkAdminAccess(w, adminId);
        WorkspaceMember member = memberRepository.findByWorkspaceIdAndUserId(workspaceId, targetUserId)
            .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
        memberRepository.delete(member);
    }

    private Workspace findById(Long id) {
        return workspaceRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Workspace", id));
    }

    private void checkAdminAccess(Workspace w, Long userId) {
        boolean isOwner = w.getOwner().getId().equals(userId);
        boolean isAdmin = memberRepository.findByWorkspaceIdAndUserId(w.getId(), userId)
            .map(m -> m.getRole() == User.Role.ADMIN).orElse(false);
        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("Admin access required");
        }
    }
}
