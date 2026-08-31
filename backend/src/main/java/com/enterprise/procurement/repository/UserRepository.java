package com.enterprise.procurement.repository;

import com.enterprise.procurement.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = {"userRoles", "userRoles.role", "department"})
    Optional<User> findByUsername(String username);

    Optional<User> findByEmployeeId(String employeeId);

    Optional<User> findByEmail(String email);

}