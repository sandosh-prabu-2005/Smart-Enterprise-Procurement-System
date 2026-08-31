package com.enterprise.procurement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class POLineItemDto {
    private Long poLineItemId;
    private Long poId;
    private String description;
    private Integer orderedQty;
    private Integer receivedQty;
    private BigDecimal unitPrice;
}
