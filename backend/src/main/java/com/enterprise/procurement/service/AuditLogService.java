package com.enterprise.procurement.service;

import com.enterprise.procurement.entity.AuditLog;
import com.enterprise.procurement.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService extends BaseService<AuditLog, Long> {

    public AuditLogService(AuditLogRepository repository) {
        super(repository);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public AuditLog save(AuditLog auditLog) {
        return super.save(auditLog);
    }

    public AuditLog update(Long id, AuditLog auditLog) {
        AuditLog existing = findById(id);
        existing.setUser(auditLog.getUser());
        existing.setModule(auditLog.getModule());
        existing.setAction(auditLog.getAction());
        existing.setEntityName(auditLog.getEntityName());
        existing.setEntityId(auditLog.getEntityId());
        existing.setRemarks(auditLog.getRemarks());
        return save(existing);
    }
}
