package com.enterprise.procurement.controller;

import com.enterprise.procurement.dto.LoginRequest;
import com.enterprise.procurement.dto.LoginResponse;
import com.enterprise.procurement.entity.Role;
import com.enterprise.procurement.entity.User;
import com.enterprise.procurement.entity.UserRole;
import com.enterprise.procurement.repository.DepartmentRepository;
import com.enterprise.procurement.repository.UserRepository;
import com.enterprise.procurement.security.CustomUserDetailsService;
import com.enterprise.procurement.security.JwtService;
import com.enterprise.procurement.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthController authController;

    private User testUser;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        Role role1 = Role.builder().roleId(1L).roleName("REQUESTER").build();
        Role role2 = Role.builder().roleId(2L).roleName("PROCUREMENT_ADMIN").build();

        UserRole userRole1 = UserRole.builder().userRoleId(10L).role(role1).build();
        UserRole userRole2 = UserRole.builder().userRoleId(11L).role(role2).build();

        testUser = User.builder()
                .userId(1L)
                .username("testadmin")
                .passwordHash("hashedPass")
                .userRoles(List.of(userRole1, userRole2))
                .build();

        userRole1.setUser(testUser);
        userRole2.setUser(testUser);

        userDetails = org.springframework.security.core.userdetails.User.withUsername("testadmin")
                .password("hashedPass")
                .roles("REQUESTER", "PROCUREMENT_ADMIN")
                .build();
    }

    @Test
    void login_Success_ReturnsHttp200AndAssignedRoles() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testadmin");
        request.setPassword("password123");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userDetailsService.loadUserByUsername("testadmin")).thenReturn(userDetails);
        when(jwtService.generateToken(userDetails)).thenReturn("mocked-jwt-token");
        when(userRepository.findByUsername("testadmin")).thenReturn(Optional.of(testUser));

        ResponseEntity<LoginResponse> response = authController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("mocked-jwt-token", response.getBody().getAccessToken());
        assertEquals("Bearer", response.getBody().getTokenType());
        assertEquals("testadmin", response.getBody().getUsername());
        assertNotNull(response.getBody().getRoles());
        assertEquals(2, response.getBody().getRoles().size());
        assertTrue(response.getBody().getRoles().contains("REQUESTER"));
        assertTrue(response.getBody().getRoles().contains("PROCUREMENT_ADMIN"));

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userDetailsService).loadUserByUsername("testadmin");
        verify(jwtService).generateToken(userDetails);
        verify(userRepository).findByUsername("testadmin");
    }
}
