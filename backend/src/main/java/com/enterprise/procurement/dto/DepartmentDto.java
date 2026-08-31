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
public class DepartmentDto {
    private Long departmentId;
    private Long costCenterId;
    private String departmentCode;
    private String departmentName;
    private String description;
    private String status;
    private LocalDateTime createdAt;
}
