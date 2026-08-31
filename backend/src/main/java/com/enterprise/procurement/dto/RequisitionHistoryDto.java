package com.enterprise.procurement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequisitionHistoryDto {
    private Long historyId;
    private Long requisitionId;
    private Long actionBy;
    private String step;
    private String remarks;
    private LocalDateTime actionDate;
}
