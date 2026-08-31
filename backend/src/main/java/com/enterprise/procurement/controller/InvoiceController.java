package com.enterprise.procurement.controller;

import com.enterprise.procurement.entity.Invoice;
import com.enterprise.procurement.service.InvoiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin("*")
public class InvoiceController {

    private final InvoiceService service;

    public InvoiceController(InvoiceService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('Admin', 'Finance')")
    public ResponseEntity<List<Invoice>> getAll(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(service.findByStatus(status));
        }
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/po/{poId}")
    @PreAuthorize("hasAnyRole('Admin', 'Finance', 'Requester', 'Manager')")
    public ResponseEntity<List<Invoice>> getByPoId(@PathVariable Long poId) {
        return ResponseEntity.ok(service.findByPoId(poId));
    }

    @PostMapping("/upload/{poId}")
    @PreAuthorize("hasAnyRole('Admin', 'Finance')") // Simulating supplier upload
    public ResponseEntity<Invoice> uploadInvoice(@RequestBody Invoice invoice, @PathVariable Long poId) {
        return ResponseEntity.ok(service.uploadInvoice(invoice, poId));
    }

    @PostMapping("/{id}/action")
    @PreAuthorize("hasAnyRole('Admin', 'Finance')")
    public ResponseEntity<Invoice> verifyInvoice(@PathVariable Long id, @RequestParam String action, Authentication authentication) {
        return ResponseEntity.ok(service.verifyInvoice(id, authentication.getName(), action));
    }
}
