package com.enterprise.procurement.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class POReceiptCreateRequest {

    @NotNull(message = "Purchase Order ID is required")
    private Long poId;

    private String description;

    @NotNull(message = "Received quantity is required")
    @Positive(message = "Received quantity must be positive")
    private Integer qtyReceived;

    private Integer damagedQty;
    
    private String itemCondition;
    
    private String warehouse;
    
    private String remarks;
    
    private LocalDate receivedDate;
}
