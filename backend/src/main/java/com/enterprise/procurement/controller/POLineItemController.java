package com.enterprise.procurement.controller;

import com.enterprise.procurement.entity.POLineItem;
import com.enterprise.procurement.service.POLineItemService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/po-line-items")
@CrossOrigin("*")
@SecurityRequirement(name = "bearerAuth")
public class POLineItemController {

    private final POLineItemService service;

    public POLineItemController(POLineItemService service) {
        this.service = service;
    }

    // SECURITY FIX: this endpoint previously returned every line item across
    // every purchase order in the company to any authenticated user,
    // regardless of role. It now applies the same visibility rule already
    // used in PurchaseOrderController: Admin/Finance/Receiver see
    // everything; everyone else only sees line items belonging to POs
    // generated from their own requisitions.
    @GetMapping
    public ResponseEntity<List<POLineItem>> getAll(Authentication authentication) {
        boolean canViewAll = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_Admin")
                        || a.getAuthority().equals("ROLE_Finance")
                        || a.getAuthority().equals("ROLE_Receiver")
                        || a.getAuthority().equals("ROLE_Manager"));

        List<POLineItem> all = service.findAll();

        if (canViewAll) {
            return ResponseEntity.ok(all);
        }

        List<POLineItem> ownOnly = all.stream()
                .filter(item -> item.getPurchaseOrder() != null
                        && item.getPurchaseOrder().getRequisition() != null
                        && item.getPurchaseOrder().getRequisition().getCreatedBy() != null
                        && authentication.getName().equals(
                                item.getPurchaseOrder().getRequisition().getCreatedBy().getUsername()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ownOnly);
    }

    @GetMapping("/{id}")
    public ResponseEntity<POLineItem> getById(@PathVariable Long id, Authentication authentication) {
        POLineItem item = service.findById(id);

        boolean canViewAll = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_Admin")
                        || a.getAuthority().equals("ROLE_Finance")
                        || a.getAuthority().equals("ROLE_Receiver")
                        || a.getAuthority().equals("ROLE_Manager"));

        boolean ownsIt = item.getPurchaseOrder() != null
                && item.getPurchaseOrder().getRequisition() != null
                && item.getPurchaseOrder().getRequisition().getCreatedBy() != null
                && authentication.getName().equals(
                        item.getPurchaseOrder().getRequisition().getCreatedBy().getUsername());

        if (!canViewAll && !ownsIt) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(item);
    }

    // SECURITY FIX: create/update/delete previously had no role restriction
    // at all — any authenticated user could edit or delete line items on
    // any purchase order. Line items are only meant to be created as part
    // of automatic PO generation and adjusted by procurement staff.
    @PostMapping
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<POLineItem> create(@Valid @RequestBody POLineItem item) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(item));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('Admin', 'Receiver')")
    public ResponseEntity<POLineItem> update(@PathVariable Long id,
                                             @Valid @RequestBody POLineItem item) {
        return ResponseEntity.ok(service.update(id, item));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}