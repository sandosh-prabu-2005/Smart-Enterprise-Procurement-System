package com.enterprise.procurement.service;

import com.enterprise.procurement.exception.ResourceNotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;

import java.io.Serializable;
import java.util.List;

public abstract class BaseService<T, ID extends Serializable> {

    protected final JpaRepository<T, ID> repository;

    protected BaseService(JpaRepository<T, ID> repository) {
        this.repository = repository;
    }

    public List<T> findAll() {
        return repository.findAll();
    }

    public T findById(ID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id " + id));
    }

    public T save(T entity) {
        return repository.save(entity);
    }

    public void delete(ID id) {
        repository.delete(findById(id));
    }
}
