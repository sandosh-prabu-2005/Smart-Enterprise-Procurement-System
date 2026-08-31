package com.enterprise.procurement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Dashboard Summary Statistics")
public class DashboardSummaryDto {

    @Schema(description = "Total number of requisitions", example = "15")
    private long totalRequisitions;

    @Schema(description = "Number of requisitions pending approval", example = "4")
    private long pendingApprovals;

    @Schema(description = "Number of approved requisitions", example = "8")
    private long approvedRequisitions;

    @Schema(description = "Total number of purchase orders", example = "6")
    private long purchaseOrders;

    @Schema(description = "Total number of suppliers", example = "5")
    private long suppliers;
}
