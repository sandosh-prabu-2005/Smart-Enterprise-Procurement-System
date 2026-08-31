package com.enterprise.procurement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderDto {
    private Long poId;
    private String poNumber;
    private Long requisitionId;
    private Long supplierId;
    private LocalDate createdDate;
    private String stage;
    private String status;
    private LocalDateTime createdAt;
}
