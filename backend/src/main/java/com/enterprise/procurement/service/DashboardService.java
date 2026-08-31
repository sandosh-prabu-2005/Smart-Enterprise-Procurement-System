package com.enterprise.procurement.service;

import com.enterprise.procurement.dto.DashboardSummaryDto;
import com.enterprise.procurement.entity.RequisitionStatus;
import com.enterprise.procurement.repository.PurchaseOrderRepository;
import com.enterprise.procurement.repository.RequisitionRepository;
import com.enterprise.procurement.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DashboardService {

    private final RequisitionRepository requisitionRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;

    public DashboardService(RequisitionRepository requisitionRepository,
                            PurchaseOrderRepository purchaseOrderRepository,
                            SupplierRepository supplierRepository) {
        this.requisitionRepository = requisitionRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.supplierRepository = supplierRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDto getDashboardSummary() {
        long totalRequisitions = requisitionRepository.count();
        long pendingApprovals = requisitionRepository.countByStatusIn(
                List.of(
                        RequisitionStatus.PENDING_APPROVAL,
                        RequisitionStatus.SUBMITTED
                )
        );
        long approvedRequisitions = requisitionRepository.countByStatus(RequisitionStatus.APPROVED);
        long purchaseOrders = purchaseOrderRepository.count();
        long suppliers = supplierRepository.count();

        return DashboardSummaryDto.builder()
                .totalRequisitions(totalRequisitions)
                .pendingApprovals(pendingApprovals)
                .approvedRequisitions(approvedRequisitions)
                .purchaseOrders(purchaseOrders)
                .suppliers(suppliers)
                .build();
    }
}
