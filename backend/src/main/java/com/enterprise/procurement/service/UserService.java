package com.enterprise.procurement.service;

import com.enterprise.procurement.entity.User;
import com.enterprise.procurement.exception.ResourceNotFoundException;
import com.enterprise.procurement.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final com.enterprise.procurement.repository.RoleRepository roleRepository;
    private final com.enterprise.procurement.repository.UserRoleRepository userRoleRepository;

    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       com.enterprise.procurement.repository.RoleRepository roleRepository,
                       com.enterprise.procurement.repository.UserRoleRepository userRoleRepository,
                       org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User activateUser(Long id, Long roleId) {
        User user = findById(id);
        user.setStatus("ACTIVE");
        user = userRepository.save(user);

        com.enterprise.procurement.entity.Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        
        com.enterprise.procurement.entity.UserRole userRole = new com.enterprise.procurement.entity.UserRole();
        userRole.setUser(user);
        userRole.setRole(role);
        userRoleRepository.save(userRole);

        return user;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
    }

    public User save(User user) {
        if (user.getPasswordHash() != null && !user.getPasswordHash().startsWith("$2a$")) {
            user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        }
        if (user.getStatus() == null) {
            user.setStatus("ACTIVE"); // default to active if created by admin
        }
        return userRepository.save(user);
    }

    public User update(Long id, User user) {
        User existingUser = findById(id);
        existingUser.setDepartment(user.getDepartment());
        existingUser.setEmployeeId(user.getEmployeeId());
        existingUser.setUsername(user.getUsername());
        existingUser.setPasswordHash(user.getPasswordHash());
        existingUser.setFullName(user.getFullName());
        existingUser.setEmail(user.getEmail());
        existingUser.setPhone(user.getPhone());
        existingUser.setDesignation(user.getDesignation());
        existingUser.setStatus(user.getStatus());
        return userRepository.save(existingUser);
    }

    public void delete(Long id) {
        User existingUser = findById(id);
        userRepository.delete(existingUser);
    }
}
