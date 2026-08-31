package com.enterprise.procurement.controller;

import com.enterprise.procurement.entity.ApprovalRule;
import com.enterprise.procurement.service.ApprovalRuleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/approval-rules")
@CrossOrigin("*")
@PreAuthorize("hasRole('Admin')")
public class ApprovalRuleController {

    private final ApprovalRuleService service;

    public ApprovalRuleController(ApprovalRuleService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ApprovalRule>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApprovalRule> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<ApprovalRule> create(@Valid @RequestBody ApprovalRule rule) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(rule));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApprovalRule> update(@PathVariable Long id,
                                               @Valid @RequestBody ApprovalRule rule) {
        return ResponseEntity.ok(service.update(id, rule));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}