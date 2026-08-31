package com.enterprise.procurement.controller;

import com.enterprise.procurement.entity.AuditLog;
import com.enterprise.procurement.service.AuditLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin("*")
@PreAuthorize("hasAnyRole('Admin', 'Finance')")
public class AuditLogController {

    private final AuditLogService service;

    public AuditLogController(AuditLogService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditLog> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<AuditLog> create(@Valid @RequestBody AuditLog auditLog) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(auditLog));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuditLog> update(@PathVariable Long id,
                                           @Valid @RequestBody AuditLog auditLog) {
        return ResponseEntity.ok(service.update(id, auditLog));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}