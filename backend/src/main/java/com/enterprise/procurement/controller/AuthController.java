package com.enterprise.procurement.controller;

import com.enterprise.procurement.dto.JwtResponse;
import com.enterprise.procurement.dto.LoginRequest;
import com.enterprise.procurement.dto.LoginResponse;
import com.enterprise.procurement.dto.RegisterRequest;
import com.enterprise.procurement.dto.RegisterResponse;
import com.enterprise.procurement.entity.Department;
import com.enterprise.procurement.entity.User;
import com.enterprise.procurement.exception.ResourceNotFoundException;
import com.enterprise.procurement.repository.DepartmentRepository;
import com.enterprise.procurement.repository.UserRepository;
import com.enterprise.procurement.security.CustomUserDetailsService;
import com.enterprise.procurement.security.JwtService;
import com.enterprise.procurement.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
@Validated
@Tag(name = "Authentication", description = "Endpoints for user registration and authentication")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                          CustomUserDetailsService userDetailsService,
                          JwtService jwtService,
                          UserService userService,
                          UserRepository userRepository,
                          DepartmentRepository departmentRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.userService = userService;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new RegisterResponse("Public registration is disabled. Please contact your system administrator for access.", null));
    }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticates user with credentials and returns JWT token along with user roles.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully authenticated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("[AUTH] Login attempt received for username: {}", request.getUsername());
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
            log.info("[AUTH] AuthenticationManager successful for username: {}", request.getUsername());
        } catch (org.springframework.security.core.AuthenticationException e) {
            log.error("[AUTH] Authentication failed for username: {}. Reason: {}", request.getUsername(), e.getMessage());
            Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
            if (userOpt.isPresent()) {
                String hash = userOpt.get().getPasswordHash();
                String maskedHash = hash != null && hash.length() > 7 ? hash.substring(0, 7) + "..." : "invalid";
                log.error("[AUTH_DEBUG] User exists in DB. Stored hash: {}. Result of matches: {}", 
                        maskedHash, passwordEncoder.matches(request.getPassword(), hash));
            } else {
                log.error("[AUTH_DEBUG] User does not exist in DB: {}", request.getUsername());
            }
            throw e;
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtService.generateToken(userDetails);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUsername()));

        List<String> roles = user.getUserRoles() == null ? Collections.emptyList() :
                user.getUserRoles().stream()
                        .filter(ur -> ur.getRole() != null && ur.getRole().getRoleName() != null)
                        .map(ur -> ur.getRole().getRoleName())
                        .collect(Collectors.toList());

        return ResponseEntity.ok(LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .username(userDetails.getUsername())
                .roles(roles)
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .departmentId(user.getDepartment() != null ? user.getDepartment().getDepartmentId() : null)
                .departmentName(user.getDepartment() != null ? user.getDepartment().getDepartmentName() : null)
                .build());
    }
}
