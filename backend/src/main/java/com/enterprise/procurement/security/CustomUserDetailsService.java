package com.enterprise.procurement.security;

import com.enterprise.procurement.entity.User;
import com.enterprise.procurement.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;
import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("[USER_DETAILS_SERVICE] Loading user details for: {}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.error("[USER_DETAILS_SERVICE] User not found with username: {}", username);
                    return new UsernameNotFoundException("User not found with username: " + username);
                });

        log.info("[USER_DETAILS_SERVICE] User found: {}. Status: {}", username, user.getStatus());
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPasswordHash(),
                "ACTIVE".equalsIgnoreCase(user.getStatus()), // enabled
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                getAuthorities(user)
        );
    }

    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        if (user.getUserRoles() == null || user.getUserRoles().isEmpty()) {
            return Collections.emptyList();
        }

        return user.getUserRoles().stream()
                .map(userRole -> {
                    if (userRole.getRole() == null) {
                        return null;
                    }
                    String roleName = userRole.getRole().getRoleName();
                    if (roleName == null) {
                        return null;
                    }
                    if (!roleName.startsWith("ROLE_")) {
                        roleName = "ROLE_" + roleName;
                    }
                    return new SimpleGrantedAuthority(roleName);
                })
                .filter(authority -> authority != null)
                .collect(Collectors.toList());
    }
}
