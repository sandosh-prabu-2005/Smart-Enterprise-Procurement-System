package com.enterprise.procurement.controller;

import com.enterprise.procurement.entity.POReceipt;
import com.enterprise.procurement.service.POReceiptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/po-receipts")
@CrossOrigin("*")
@Tag(name = "PO Receipts", description = "Endpoints for managing goods receipt notes and updating PO delivery statuses")
@SecurityRequirement(name = "bearerAuth")
public class POReceiptController {

    private final POReceiptService service;

    public POReceiptController(POReceiptService service) {
        this.service = service;
    }

    // SECURITY FIX: this previously returned every receipt across every
    // purchase order in the company to any authenticated user. Now applies
    // the same visibility rule used everywhere else: Admin/Finance/Receiver/
    // Manager see everything; a Requester only sees receipts belonging to
    // POs generated from their own requisitions.
    @GetMapping
    @Operation(summary = "Get all PO receipts", description = "Retrieve a list of purchase order receipts visible to the current user")
    public ResponseEntity<List<POReceipt>> getAll(Authentication authentication) {
        boolean canViewAll = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_Admin")
                        || a.getAuthority().equals("ROLE_Finance")
                        || a.getAuthority().equals("ROLE_Receiver")
                        || a.getAuthority().equals("ROLE_Manager"));

        List<POReceipt> all = service.findAll();

        if (canViewAll) {
            return ResponseEntity.ok(all);
        }

        List<POReceipt> ownOnly = all.stream()
                .filter(receipt -> receipt.getPurchaseOrder() != null
                        && receipt.getPurchaseOrder().getRequisition() != null
                        && receipt.getPurchaseOrder().getRequisition().getCreatedBy() != null
                        && authentication.getName().equals(
                                receipt.getPurchaseOrder().getRequisition().getCreatedBy().getUsername()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ownOnly);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get PO receipt by ID", description = "Retrieve details of a specific receipt by ID")
    public ResponseEntity<POReceipt> getById(@PathVariable Long id, Authentication authentication) {
        POReceipt receipt = service.findById(id);

        boolean canViewAll = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_Admin")
                        || a.getAuthority().equals("ROLE_Finance")
                        || a.getAuthority().equals("ROLE_Receiver")
                        || a.getAuthority().equals("ROLE_Manager"));

        boolean ownsIt = receipt.getPurchaseOrder() != null
                && receipt.getPurchaseOrder().getRequisition() != null
                && receipt.getPurchaseOrder().getRequisition().getCreatedBy() != null
                && authentication.getName().equals(
                        receipt.getPurchaseOrder().getRequisition().getCreatedBy().getUsername());

        if (!canViewAll && !ownsIt) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(receipt);
    }

    @PostMapping
    @Operation(summary = "Create PO receipt", description = "Record goods received against a PO and automatically update PO delivery status (CREATED, PARTIALLY_DELIVERED, FULLY_DELIVERED)")
    @PreAuthorize("hasAnyRole('Admin', 'Receiver')")
    public ResponseEntity<POReceipt> create(@Valid @RequestBody com.enterprise.procurement.dto.POReceiptCreateRequest request, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.saveReceipt(request, authentication.getName()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update PO receipt", description = "Update details of an existing receipt and recalculate PO delivery status")
    @PreAuthorize("hasAnyRole('Admin', 'Receiver')")
    public ResponseEntity<POReceipt> update(@PathVariable Long id,
                                           @Valid @RequestBody POReceipt receipt) {
        return ResponseEntity.ok(service.update(id, receipt));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete PO receipt", description = "Delete a receipt and recalculate PO delivery status")
    @PreAuthorize("hasAnyRole('Admin', 'Receiver')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}