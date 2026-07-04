package com.taskflow.service;

import com.taskflow.dto.DashboardDTOs;
import com.taskflow.entity.Notification;
import com.taskflow.entity.User;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.NotificationRepository;
import com.taskflow.repository.UserRepository;
import com.taskflow.util.Mapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<DashboardDTOs.NotificationDTO> list(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(Mapper::toNotificationDTO).toList();
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    @Transactional
    public DashboardDTOs.NotificationDTO markRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));
        n.setRead(true);
        notificationRepository.save(n);
        return Mapper.toNotificationDTO(n);
    }

    @Transactional
    public void delete(Long notificationId) {
        notificationRepository.delete(notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId)));
    }

    /** Internal helper — call this from other services to create notifications. */
    @Transactional
    public void create(Long userId, Notification.Type type, String message, Long taskId) {
        userRepository.findById(userId).ifPresent(user -> {
            Notification n = Notification.builder()
                .user(user).type(type).message(message).taskId(taskId).build();
            notificationRepository.save(n);
        });
    }

    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }
}
