package com.enterprise.procurement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long userId;

    @NotNull
    private Long departmentId;

    @NotBlank
    private String employeeId;

    @NotBlank
    private String username;

    private String password;

    @NotBlank
    private String fullName;

    @Email
    @NotBlank
    private String email;

    private String phone;
    private String designation;
    private String status;
}
