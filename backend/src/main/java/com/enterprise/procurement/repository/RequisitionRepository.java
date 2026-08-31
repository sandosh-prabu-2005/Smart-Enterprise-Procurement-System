package com.enterprise.procurement.repository;

import com.enterprise.procurement.entity.Requisition;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RequisitionRepository extends JpaRepository<Requisition, Long> {
    
    List<Requisition> findAllByOrderByCreatedAtDesc();

    List<Requisition> findByCreatedBy_UsernameOrderByCreatedAtDesc(String username);

    List<Requisition> findByStatusOrderByCreatedAtDesc(String status);

    long countByStatus(String status);

    long countByStatusIn(List<String> statuses);
}