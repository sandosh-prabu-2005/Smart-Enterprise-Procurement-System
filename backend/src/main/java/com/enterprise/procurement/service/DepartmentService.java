package com.enterprise.procurement.service;

import com.enterprise.procurement.entity.Department;
import com.enterprise.procurement.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

@Service
public class DepartmentService extends BaseService<Department, Long> {

    public DepartmentService(DepartmentRepository repository) {
        super(repository);
    }

    public Department update(Long id, Department department) {
        Department existing = findById(id);
        existing.setCostCenter(department.getCostCenter());
        existing.setDepartmentCode(department.getDepartmentCode());
        existing.setDepartmentName(department.getDepartmentName());
        existing.setDescription(department.getDescription());
        existing.setStatus(department.getStatus());
        return save(existing);
    }
}
