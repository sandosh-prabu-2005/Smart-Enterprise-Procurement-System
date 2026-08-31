package com.enterprise.procurement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class RequisitionLineItemDto {
    private Long lineItemId;

    @NotNull
    private Long requisitionId;

    @NotBlank
    private String description;

    @NotNull
    private Integer quantity;

    @NotNull
    private BigDecimal unitPrice;
}
