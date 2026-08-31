package com.enterprise.procurement.repository;

import com.enterprise.procurement.entity.POLineItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface POLineItemRepository extends JpaRepository<POLineItem, Long> {
}