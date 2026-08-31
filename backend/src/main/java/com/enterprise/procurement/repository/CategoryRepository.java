package com.enterprise.procurement.repository;

import com.enterprise.procurement.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}