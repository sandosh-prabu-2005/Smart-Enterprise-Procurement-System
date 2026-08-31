package com.enterprise.procurement.event;

import com.enterprise.procurement.entity.PurchaseOrder;
import com.enterprise.procurement.service.PurchaseOrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class RequisitionApprovedListener {

    private static final Logger log = LoggerFactory.getLogger(RequisitionApprovedListener.class);
    private final PurchaseOrderService purchaseOrderService;

    public RequisitionApprovedListener(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @org.springframework.context.event.EventListener
    public void handleRequisitionApproved(RequisitionApprovedEvent event) {
        log.info("[EVENT_LISTENER] Requisition approved event received for requisition ID: {}. Generating Purchase Order...", 
                event.getRequisition().getRequisitionId());
        
        PurchaseOrder po = purchaseOrderService.createFromRequisition(event.getRequisition());
        log.info("[EVENT_LISTENER] Purchase Order generated successfully: {}", po.getPoNumber());
    }
}
