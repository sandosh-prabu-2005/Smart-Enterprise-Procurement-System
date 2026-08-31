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
public class CostCenterDto {
    private Long costCenterId;
    private String costCenterCode;
    private String costCenterName;
    private String description;
    private String status;
    private LocalDateTime createdAt;
}
