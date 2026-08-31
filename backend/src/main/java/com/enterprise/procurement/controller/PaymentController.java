package com.enterprise.procurement.controller;

import com.enterprise.procurement.entity.Payment;
import com.enterprise.procurement.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin("*")
public class PaymentController {

    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('Admin', 'Finance')")
    public ResponseEntity<List<Payment>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/invoice/{invoiceId}")
    @PreAuthorize("hasAnyRole('Admin', 'Finance', 'Requester', 'Manager')")
    public ResponseEntity<List<Payment>> getByInvoiceId(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(service.findByInvoiceId(invoiceId));
    }

    @PostMapping("/{invoiceId}")
    @PreAuthorize("hasAnyRole('Admin', 'Finance')")
    public ResponseEntity<Payment> createPayment(@RequestBody Payment payment, @PathVariable Long invoiceId, Authentication authentication) {
        return ResponseEntity.ok(service.createPayment(payment, invoiceId, authentication.getName()));
    }
}
