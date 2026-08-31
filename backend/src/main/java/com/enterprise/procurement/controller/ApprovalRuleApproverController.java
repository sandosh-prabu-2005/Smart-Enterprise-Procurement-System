package com.enterprise.procurement.controller;

import com.enterprise.procurement.entity.ApprovalRuleApprover;
import com.enterprise.procurement.service.ApprovalRuleApproverService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/approval-rule-approvers")
@CrossOrigin("*")
@PreAuthorize("hasRole('Admin')")
public class ApprovalRuleApproverController {

    private final ApprovalRuleApproverService service;

    public ApprovalRuleApproverController(ApprovalRuleApproverService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ApprovalRuleApprover>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApprovalRuleApprover> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<ApprovalRuleApprover> create(@Valid @RequestBody ApprovalRuleApprover approver) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(approver));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApprovalRuleApprover> update(@PathVariable Long id,
                                                       @Valid @RequestBody ApprovalRuleApprover approver) {
        return ResponseEntity.ok(service.update(id, approver));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}