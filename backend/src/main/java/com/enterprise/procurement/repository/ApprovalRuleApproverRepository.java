package com.enterprise.procurement.repository;

import com.enterprise.procurement.entity.ApprovalRuleApprover;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApprovalRuleApproverRepository extends JpaRepository<ApprovalRuleApprover, Long> {

    List<ApprovalRuleApprover> findByRule_RuleIdOrderBySequenceNoAsc(Long ruleId);
}