package com.enterprise.procurement.controller;

import com.enterprise.procurement.entity.User;
import com.enterprise.procurement.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
@PreAuthorize("hasRole('Admin')")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<User> create(@Valid @RequestBody User user, @RequestParam(required = false) Long roleId) {
        User savedUser = service.save(user);
        if (roleId != null) {
            service.activateUser(savedUser.getUserId(), roleId);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Long id,
                                       @Valid @RequestBody User user) {
        return ResponseEntity.ok(service.update(id, user));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<User> activate(@PathVariable Long id, @RequestParam Long roleId) {
        return ResponseEntity.ok(service.activateUser(id, roleId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
