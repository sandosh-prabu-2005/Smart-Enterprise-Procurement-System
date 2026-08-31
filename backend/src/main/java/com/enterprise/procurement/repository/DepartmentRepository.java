package com.enterprise.procurement.repository;

import com.enterprise.procurement.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
}