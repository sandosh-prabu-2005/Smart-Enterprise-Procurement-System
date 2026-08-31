package com.enterprise.procurement.service;

import com.enterprise.procurement.entity.Category;
import com.enterprise.procurement.repository.CategoryRepository;
import org.springframework.stereotype.Service;

@Service
public class CategoryService extends BaseService<Category, Long> {

    public CategoryService(CategoryRepository repository) {
        super(repository);
    }

    public Category update(Long id, Category category) {
        Category existing = findById(id);
        existing.setCategoryCode(category.getCategoryCode());
        existing.setCategoryName(category.getCategoryName());
        existing.setDescription(category.getDescription());
        existing.setStatus(category.getStatus());
        return save(existing);
    }
}
