package com.enterprise.procurement.service;

import com.enterprise.procurement.entity.RequisitionLineItem;
import com.enterprise.procurement.repository.RequisitionLineItemRepository;
import org.springframework.stereotype.Service;

@Service
public class RequisitionLineItemService extends BaseService<RequisitionLineItem, Long> {

    public RequisitionLineItemService(RequisitionLineItemRepository repository) {
        super(repository);
    }

    public RequisitionLineItem update(Long id, RequisitionLineItem lineItem) {
        RequisitionLineItem existing = findById(id);
        existing.setRequisition(lineItem.getRequisition());
        existing.setDescription(lineItem.getDescription());
        existing.setQuantity(lineItem.getQuantity());
        existing.setUnitPrice(lineItem.getUnitPrice());
        return save(existing);
    }
}
