package com.enterprise.procurement.repository;

import com.enterprise.procurement.entity.Requisition;
import com.enterprise.procurement.entity.RequisitionLineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RequisitionLineItemRepository extends JpaRepository<RequisitionLineItem, Long> {

    List<RequisitionLineItem> findByRequisition(Requisition requisition);
}