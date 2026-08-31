package com.enterprise.procurement.repository;

import com.enterprise.procurement.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser_UsernameOrderByCreatedAtDesc(String username);
    List<Notification> findByUser_UsernameAndIsReadFalseOrderByCreatedAtDesc(String username);
}
