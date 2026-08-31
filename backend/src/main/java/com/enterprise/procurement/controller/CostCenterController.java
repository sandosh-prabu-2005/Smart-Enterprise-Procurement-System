package com.enterprise.procurement.controller;

import com.enterprise.procurement.entity.CostCenter;
import com.enterprise.procurement.service.CostCenterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cost-centers")
@CrossOrigin("*")
public class CostCenterController {

    private final CostCenterService service;

    public CostCenterController(CostCenterService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<CostCenter>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CostCenter> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<CostCenter> create(@Valid @RequestBody CostCenter costCenter) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(costCenter));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CostCenter> update(@PathVariable Long id,
                                             @Valid @RequestBody CostCenter costCenter) {
        return ResponseEntity.ok(service.update(id, costCenter));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
