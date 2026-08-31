package com.enterprise.procurement.service;

import com.enterprise.procurement.entity.UserRole;
import com.enterprise.procurement.repository.UserRoleRepository;
import org.springframework.stereotype.Service;

@Service
public class UserRoleService extends BaseService<UserRole, Long> {

    public UserRoleService(UserRoleRepository repository) {
        super(repository);
    }

    public UserRole update(Long id, UserRole userRole) {
        UserRole existing = findById(id);
        existing.setUser(userRole.getUser());
        existing.setRole(userRole.getRole());
        return save(existing);
    }
}
