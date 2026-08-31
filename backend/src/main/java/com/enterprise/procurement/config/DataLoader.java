package com.enterprise.procurement.config;

import com.enterprise.procurement.entity.Role;
import com.enterprise.procurement.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public DataLoader(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        seedRoles();
    }

    private void seedRoles() {
        if (roleRepository.count() == 0) {
            roleRepository.save(Role.builder().roleName("Requester").description("Can create requisitions").build());
            roleRepository.save(Role.builder().roleName("Manager").description("Can approve department requisitions").build());
            roleRepository.save(Role.builder().roleName("Finance").description("Can approve high value requisitions and pay invoices").build());
            roleRepository.save(Role.builder().roleName("Receiver").description("Can receive goods").build());
            roleRepository.save(Role.builder().roleName("Admin").description("System administrator").build());
        }
    }
}
