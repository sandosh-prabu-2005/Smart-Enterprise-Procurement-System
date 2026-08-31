package com.enterprise.procurement.controller;

import com.enterprise.procurement.dto.DashboardSummaryDto;
import com.enterprise.procurement.service.DashboardService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardControllerTest {

    @Mock
    private DashboardService dashboardService;

    @InjectMocks
    private DashboardController dashboardController;

    @Test
    void getSummary_ReturnsDashboardSummaryDto() {
        DashboardSummaryDto dto = DashboardSummaryDto.builder()
                .totalRequisitions(10)
                .pendingApprovals(3)
                .approvedRequisitions(5)
                .purchaseOrders(4)
                .suppliers(2)
                .build();

        when(dashboardService.getDashboardSummary()).thenReturn(dto);

        ResponseEntity<DashboardSummaryDto> response = dashboardController.getSummary();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(10, response.getBody().getTotalRequisitions());
    }
}
