package com.enterprise.procurement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprovalRuleDto {
    private Long ruleId;
    private Long departmentId;
    private Long categoryId;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
