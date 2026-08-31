package com.enterprise.procurement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierDto {
    private Long supplierId;
    private String supplierCode;
    private String supplierName;
    private String contactName;
    private String email;
    private String phone;
    private String address;
    private String gstNumber;
    private String status;
    private LocalDateTime createdAt;
}
