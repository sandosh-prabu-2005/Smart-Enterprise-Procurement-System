package com.enterprise.procurement.controller;

import com.enterprise.procurement.entity.PurchaseOrder;
import com.enterprise.procurement.exception.BadRequestException;
import com.enterprise.procurement.service.PurchaseOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
@CrossOrigin("*")
@Tag(name = "Purchase Orders", description = "Endpoints for managing Purchase Orders")
@SecurityRequirement(name = "bearerAuth")
public class PurchaseOrderController {

    private final PurchaseOrderService service;

    public PurchaseOrderController(PurchaseOrderService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Get purchase orders", description = "Retrieve a list of purchase orders based on role")
    public ResponseEntity<List<PurchaseOrder>> getAll(org.springframework.security.core.Authentication authentication) {
        boolean isAdminOrFinanceOrReceiver = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_Admin") || a.getAuthority().equals("ROLE_Finance") || a.getAuthority().equals("ROLE_Receiver"));

        boolean isManager = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_Manager"));

        List<PurchaseOrder> allPos = service.findAll();
        
        if (isAdminOrFinanceOrReceiver) {
            return ResponseEntity.ok(allPos);
        } else if (isManager) {
            // TODO: In a full implementation, filter by Manager's department.
            // For now, allow managers to view all POs to unblock workflow.
            return ResponseEntity.ok(allPos);
        } else {
            // For Requesters, show only POs generated from their own requisitions
            List<PurchaseOrder> myPos = allPos.stream()
                    .filter(po -> po.getRequisition() != null && 
                                  po.getRequisition().getCreatedBy() != null &&
                                  authentication.getName().equals(po.getRequisition().getCreatedBy().getUsername()))
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(myPos);
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get purchase order by ID", description = "Retrieve details of a specific purchase order by ID")
    public ResponseEntity<PurchaseOrder> getById(@PathVariable Long id, org.springframework.security.core.Authentication authentication) {
        PurchaseOrder po = service.findById(id);
        boolean isAdminOrFinanceOrReceiver = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_Admin") || a.getAuthority().equals("ROLE_Finance") || a.getAuthority().equals("ROLE_Receiver"));
        
        boolean isManager = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_Manager"));

        if (!isAdminOrFinanceOrReceiver && !isManager && (po.getRequisition() == null || po.getRequisition().getCreatedBy() == null || !authentication.getName().equals(po.getRequisition().getCreatedBy().getUsername()))) {
             return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(po);
    }

    @PutMapping("/{id}/supplier-status")
    @Operation(summary = "Update supplier status", description = "Update the supplier status of a purchase order (e.g. ACCEPTED, IN_TRANSIT, DELIVERED)")
    @PreAuthorize("hasAnyRole('Admin', 'Finance')") // Simulating supplier portal action for now
    public ResponseEntity<PurchaseOrder> updateSupplierStatus(@PathVariable Long id, @RequestParam String status) {
        PurchaseOrder po = service.findById(id);
        po.setStatus(status);
        po.setStage(status);
        return ResponseEntity.ok(service.save(po));
    }

    @PostMapping
    @Operation(summary = "Manual purchase order creation (Disabled)", description = "Manual PO creation is disabled. POs are created automatically when requisitions are approved.")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<PurchaseOrder> create(@Valid @RequestBody PurchaseOrder order) {
        throw new BadRequestException("Manual Purchase Order creation is not allowed. Purchase Orders are generated automatically upon requisition approval.");
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update purchase order", description = "Update details of an existing purchase order")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<PurchaseOrder> update(@PathVariable Long id,
                                                @Valid @RequestBody PurchaseOrder order) {
        return ResponseEntity.ok(service.update(id, order));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete purchase order", description = "Delete a purchase order by ID")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}