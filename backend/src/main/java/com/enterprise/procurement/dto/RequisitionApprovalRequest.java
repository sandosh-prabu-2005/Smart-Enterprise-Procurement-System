package com.enterprise.procurement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request body for approving or rejecting a requisition")
public class RequisitionApprovalRequest {

    @Schema(description = "Optional remarks or justification for approval or rejection", example = "Approved after budget review")
    private String remarks;
}
