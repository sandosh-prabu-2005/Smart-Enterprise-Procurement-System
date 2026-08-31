package com.enterprise.procurement.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "cost_centers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CostCenter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cost_center_id")
    private Long costCenterId;

    @Column(name = "cost_center_code", nullable = false, unique = true)
    private String costCenterCode;

    @Column(name = "cost_center_name", nullable = false)
    private String costCenterName;

    @Column(name = "description")
    private String description;

    @Column(name = "status")
    private String status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "costCenter", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Department> departments;
}
