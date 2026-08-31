package com.enterprise.procurement.controller;

import com.enterprise.procurement.dto.DashboardSummaryDto;
import com.enterprise.procurement.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("*")
@Tag(name = "Dashboard", description = "Endpoints for dashboard metrics and summary statistics")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get dashboard summary metrics", description = "Retrieves aggregated counts of total requisitions, pending approvals, approved requisitions, purchase orders, and suppliers.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dashboard summary fetched successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = DashboardSummaryDto.class)))
    })
    public ResponseEntity<DashboardSummaryDto> getSummary() {
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }
}
