package com.enterprise.procurement.repository;

import com.enterprise.procurement.entity.POReceipt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface POReceiptRepository extends JpaRepository<POReceipt, Long> {
    List<POReceipt> findByPurchaseOrder_PoId(Long poId);
}