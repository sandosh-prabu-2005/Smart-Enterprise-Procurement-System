package com.enterprise.procurement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequisitionDto {
    private Long requisitionId;

    @NotBlank
    private String requisitionNumber;

    @NotNull
    private Long createdBy;

    @NotNull
    private Long departmentId;

    private Long supplierId;

    @NotNull
    private Long categoryId;

    @NotBlank
    private String title;

    private String justification;
    private LocalDate neededBy;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;
}
