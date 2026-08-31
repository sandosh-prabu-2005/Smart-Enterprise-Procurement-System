package com.enterprise.procurement.service;

import com.enterprise.procurement.entity.Notification;
import com.enterprise.procurement.entity.User;
import com.enterprise.procurement.repository.NotificationRepository;
import com.enterprise.procurement.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class NotificationService extends BaseService<Notification, Long> {

    private final UserRepository userRepository;

    public NotificationService(NotificationRepository repository, UserRepository userRepository) {
        super(repository);
        this.userRepository = userRepository;
    }

    public List<Notification> findMyNotifications(String username) {
        return ((NotificationRepository) repository).findByUser_UsernameOrderByCreatedAtDesc(username);
    }

    public List<Notification> findMyUnreadNotifications(String username) {
        return ((NotificationRepository) repository).findByUser_UsernameAndIsReadFalseOrderByCreatedAtDesc(username);
    }

    @Transactional
    public Notification createNotification(String username, String title, String message, String module, Long referenceId) {
        userRepository.findByUsername(username).ifPresent(user -> {
            Notification notification = Notification.builder()
                    .user(user)
                    .title(title)
                    .message(message)
                    .module(module)
                    .referenceId(referenceId)
                    .isRead(false)
                    .build();
            save(notification);
        });
        return null;
    }

    @Transactional
    public void markAsRead(Long id, String username) {
        Notification notification = findById(id);
        if (notification.getUser().getUsername().equals(username)) {
            notification.setIsRead(true);
            save(notification);
        }
    }
    
    @Transactional
    public void markAllAsRead(String username) {
        List<Notification> unread = findMyUnreadNotifications(username);
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        repository.saveAll(unread);
    }
}
