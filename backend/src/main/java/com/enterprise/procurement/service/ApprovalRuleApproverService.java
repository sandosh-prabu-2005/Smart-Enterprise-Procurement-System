package com.enterprise.procurement.service;

import com.enterprise.procurement.entity.ApprovalRuleApprover;
import com.enterprise.procurement.repository.ApprovalRuleApproverRepository;
import org.springframework.stereotype.Service;

@Service
public class ApprovalRuleApproverService extends BaseService<ApprovalRuleApprover, Long> {

    public ApprovalRuleApproverService(ApprovalRuleApproverRepository repository) {
        super(repository);
    }

    public ApprovalRuleApprover update(Long id, ApprovalRuleApprover approver) {
        ApprovalRuleApprover existing = findById(id);
        existing.setRule(approver.getRule());
        existing.setSequenceNo(approver.getSequenceNo());
        existing.setRole(approver.getRole());
        return save(existing);
    }
}
