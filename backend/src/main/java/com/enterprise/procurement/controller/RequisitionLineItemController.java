package com.enterprise.procurement.controller;

import com.enterprise.procurement.entity.RequisitionLineItem;
import com.enterprise.procurement.service.RequisitionLineItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requisition-line-items")
@CrossOrigin("*")
public class RequisitionLineItemController {

    private final RequisitionLineItemService service;

    public RequisitionLineItemController(RequisitionLineItemService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<RequisitionLineItem>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RequisitionLineItem> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<RequisitionLineItem> create(@Valid @RequestBody RequisitionLineItem item) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RequisitionLineItem> update(@PathVariable Long id,
                                                      @Valid @RequestBody RequisitionLineItem item) {
        return ResponseEntity.ok(service.update(id, item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}