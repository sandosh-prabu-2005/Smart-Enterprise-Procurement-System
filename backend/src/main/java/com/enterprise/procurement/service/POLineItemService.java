package com.enterprise.procurement.service;

import com.enterprise.procurement.entity.POLineItem;
import com.enterprise.procurement.repository.POLineItemRepository;
import org.springframework.stereotype.Service;

@Service
public class POLineItemService extends BaseService<POLineItem, Long> {

    public POLineItemService(POLineItemRepository repository) {
        super(repository);
    }

    public POLineItem update(Long id, POLineItem polineItem) {
        POLineItem existing = findById(id);
        existing.setPurchaseOrder(polineItem.getPurchaseOrder());
        existing.setDescription(polineItem.getDescription());
        existing.setOrderedQty(polineItem.getOrderedQty());
        existing.setReceivedQty(polineItem.getReceivedQty());
        existing.setUnitPrice(polineItem.getUnitPrice());
        return save(existing);
    }
}
