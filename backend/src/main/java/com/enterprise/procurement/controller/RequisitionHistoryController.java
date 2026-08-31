package com.enterprise.procurement.controller;

import com.enterprise.procurement.entity.RequisitionHistory;
import com.enterprise.procurement.service.RequisitionHistoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requisition-history")
@CrossOrigin("*")
public class RequisitionHistoryController {

    private final RequisitionHistoryService service;

    public RequisitionHistoryController(RequisitionHistoryService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<RequisitionHistory>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RequisitionHistory> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<RequisitionHistory> create(@Valid @RequestBody RequisitionHistory history) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(history));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RequisitionHistory> update(@PathVariable Long id,
                                                     @Valid @RequestBody RequisitionHistory history) {
        return ResponseEntity.ok(service.update(id, history));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}