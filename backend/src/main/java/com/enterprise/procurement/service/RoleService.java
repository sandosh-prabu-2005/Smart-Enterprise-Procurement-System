package com.enterprise.procurement.service;

import com.enterprise.procurement.entity.Role;
import com.enterprise.procurement.repository.RoleRepository;
import org.springframework.stereotype.Service;

@Service
public class RoleService extends BaseService<Role, Long> {

    public RoleService(RoleRepository repository) {
        super(repository);
    }

    public Role update(Long id, Role role) {
        Role existing = findById(id);
        existing.setRoleName(role.getRoleName());
        existing.setDescription(role.getDescription());
        return save(existing);
    }
}
