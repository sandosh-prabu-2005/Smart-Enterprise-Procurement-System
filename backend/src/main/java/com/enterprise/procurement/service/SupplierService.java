package com.enterprise.procurement.service;

import com.enterprise.procurement.entity.Supplier;
import com.enterprise.procurement.repository.SupplierRepository;
import org.springframework.stereotype.Service;

@Service
public class SupplierService extends BaseService<Supplier, Long> {

    public SupplierService(SupplierRepository repository) {
        super(repository);
    }

    public Supplier update(Long id, Supplier supplier) {
        Supplier existing = findById(id);
        existing.setSupplierCode(supplier.getSupplierCode());
        existing.setSupplierName(supplier.getSupplierName());
        existing.setContactName(supplier.getContactName());
        existing.setEmail(supplier.getEmail());
        existing.setPhone(supplier.getPhone());
        existing.setAddress(supplier.getAddress());
        existing.setGstNumber(supplier.getGstNumber());
        existing.setStatus(supplier.getStatus());
        return save(existing);
    }
}
