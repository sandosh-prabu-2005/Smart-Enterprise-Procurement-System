package com.enterprise.procurement.repository;

import com.enterprise.procurement.entity.CostCenter;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CostCenterRepository extends JpaRepository<CostCenter, Long> {
}
