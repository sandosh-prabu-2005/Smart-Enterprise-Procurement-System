package com.enterprise.procurement.service;

import com.enterprise.procurement.entity.ApprovalRule;
import com.enterprise.procurement.repository.ApprovalRuleRepository;
import org.springframework.stereotype.Service;

@Service
public class ApprovalRuleService extends BaseService<ApprovalRule, Long> {

    public ApprovalRuleService(ApprovalRuleRepository repository) {
        super(repository);
    }

    public ApprovalRule update(Long id, ApprovalRule approvalRule) {
        ApprovalRule existing = findById(id);
        existing.setDepartment(approvalRule.getDepartment());
        existing.setCategory(approvalRule.getCategory());
        existing.setMinAmount(approvalRule.getMinAmount());
        existing.setMaxAmount(approvalRule.getMaxAmount());
        existing.setIsActive(approvalRule.getIsActive());
        return save(existing);
    }
}
