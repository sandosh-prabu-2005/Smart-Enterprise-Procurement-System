package com.enterprise.procurement.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class RequisitionDetailDto {
    private Long requisitionId;
    private String requisitionNumber;
    private String title;
    private String justification;
    private LocalDate neededBy;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private String createdByFullName;
    private String departmentName;
    private String supplierName;
    private String categoryName;
    private List<RequisitionLineItemDto> items;
    private List<RequisitionHistoryDto> history;
}
