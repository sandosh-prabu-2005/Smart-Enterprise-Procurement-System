package com.enterprise.procurement.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response object returned upon successful login containing JWT token, token metadata, username, and assigned user roles")
public class LoginResponse {

    @Schema(description = "JWT access token for authenticating subsequent API requests", example = "eyJhbGciOiJIUzI1NiJ9...")
    private String accessToken;

    @Schema(description = "Token type prefix", example = "Bearer")
    @Builder.Default
    private String tokenType = "Bearer";

    @Schema(description = "Username of the authenticated user", example = "testadmin")
    private String username;

    @Schema(description = "List of role names assigned to the user", example = "[\"REQUESTER\", \"PROCUREMENT_ADMIN\"]")
    private List<String> roles;

    private Long userId;
    private String fullName;
    private Long departmentId;
    private String departmentName;

    public LoginResponse(String accessToken, String tokenType, String username) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
        this.username = username;
    }
}
