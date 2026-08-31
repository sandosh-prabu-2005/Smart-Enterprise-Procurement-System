package com.enterprise.procurement.service;

import com.enterprise.procurement.entity.CostCenter;
import com.enterprise.procurement.exception.ResourceNotFoundException;
import com.enterprise.procurement.repository.CostCenterRepository;
import org.springframework.stereotype.Service;

@Service
public class CostCenterService extends BaseService<CostCenter, Long> {

    public CostCenterService(CostCenterRepository repository) {
        super(repository);
    }

    public CostCenter update(Long id, CostCenter costCenter) {
        CostCenter existing = findById(id);
        existing.setCostCenterCode(costCenter.getCostCenterCode());
        existing.setCostCenterName(costCenter.getCostCenterName());
        existing.setDescription(costCenter.getDescription());
        existing.setStatus(costCenter.getStatus());
        return save(existing);
    }
}
