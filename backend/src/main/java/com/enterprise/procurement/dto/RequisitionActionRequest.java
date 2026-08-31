package com.enterprise.procurement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RequisitionActionRequest {

    @NotBlank(message = "Action is required")
    private String action;

    private String remarks;
}
