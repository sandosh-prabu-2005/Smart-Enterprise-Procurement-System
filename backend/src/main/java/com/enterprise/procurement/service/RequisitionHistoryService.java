package com.enterprise.procurement.service;

import com.enterprise.procurement.entity.RequisitionHistory;
import com.enterprise.procurement.repository.RequisitionHistoryRepository;
import org.springframework.stereotype.Service;

@Service
public class RequisitionHistoryService extends BaseService<RequisitionHistory, Long> {

    public RequisitionHistoryService(RequisitionHistoryRepository repository) {
        super(repository);
    }

    public RequisitionHistory update(Long id, RequisitionHistory history) {
        RequisitionHistory existing = findById(id);
        existing.setRequisition(history.getRequisition());
        existing.setActionBy(history.getActionBy());
        existing.setStep(history.getStep());
        existing.setRemarks(history.getRemarks());
        return save(existing);
    }
}
