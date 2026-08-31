package com.enterprise.procurement.event;

import com.enterprise.procurement.entity.Requisition;
import org.springframework.context.ApplicationEvent;

public class RequisitionApprovedEvent extends ApplicationEvent {
    private final Requisition requisition;

    public RequisitionApprovedEvent(Object source, Requisition requisition) {
        super(source);
        this.requisition = requisition;
    }

    public Requisition getRequisition() {
        return requisition;
    }
}
