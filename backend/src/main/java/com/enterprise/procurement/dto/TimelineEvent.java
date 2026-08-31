package com.enterprise.procurement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelineEvent {
    private String step;
    private String actionBy;
    private String remarks;
    private LocalDateTime actionDate;
}
