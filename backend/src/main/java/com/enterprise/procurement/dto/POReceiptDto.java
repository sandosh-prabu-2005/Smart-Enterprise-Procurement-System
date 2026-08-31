package com.enterprise.procurement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class POReceiptDto {
    private Long receiptId;
    private Long poId;
    private String description;
    private Integer qtyReceived;
    private LocalDate receivedDate;
    private Long receivedBy;
}
