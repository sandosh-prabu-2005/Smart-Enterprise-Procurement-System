package com.enterprise.procurement.controller;

import com.enterprise.procurement.entity.UserRole;
import com.enterprise.procurement.service.UserRoleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/user-roles")
@CrossOrigin("*")
@PreAuthorize("hasRole('Admin')")
public class UserRoleController {

    private final UserRoleService service;

    public UserRoleController(UserRoleService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<UserRole>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserRole> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<UserRole> create(@Valid @RequestBody UserRole userRole) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(userRole));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserRole> update(@PathVariable Long id,
                                           @Valid @RequestBody UserRole userRole) {
        return ResponseEntity.ok(service.update(id, userRole));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
