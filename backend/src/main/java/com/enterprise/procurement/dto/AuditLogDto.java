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
public class AuditLogDto {
    private Long auditId;
    private Long userId;
    private String module;
    private String action;
    private String entityName;
    private Long entityId;
    private String remarks;
    private LocalDateTime actionTime;
}
