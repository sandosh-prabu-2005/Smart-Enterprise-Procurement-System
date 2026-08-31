package com.enterprise.procurement.service;

import com.enterprise.procurement.entity.Invoice;
import com.enterprise.procurement.entity.PurchaseOrder;
import com.enterprise.procurement.entity.User;
import com.enterprise.procurement.repository.InvoiceRepository;
import com.enterprise.procurement.repository.PurchaseOrderRepository;
import com.enterprise.procurement.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.enterprise.procurement.exception.ResourceNotFoundException;
import java.util.List;

@Service
public class InvoiceService extends BaseService<Invoice, Long> {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserRepository userRepository;
    private final com.enterprise.procurement.repository.AuditLogRepository auditLogRepository;
    private final NotificationService notificationService;

    public InvoiceService(InvoiceRepository repository,
                          PurchaseOrderRepository purchaseOrderRepository,
                          UserRepository userRepository,
                          com.enterprise.procurement.repository.AuditLogRepository auditLogRepository,
                          NotificationService notificationService) {
        super(repository);
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationService = notificationService;
    }

    public List<Invoice> findByStatus(String status) {
        return ((InvoiceRepository) repository).findByStatus(status);
    }

    public List<Invoice> findByPoId(Long poId) {
        return ((InvoiceRepository) repository).findByPurchaseOrder_PoId(poId);
    }

    @Transactional
    public Invoice uploadInvoice(Invoice invoice, Long poId) {
        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found"));
                
        if (invoice.getAmount() == null) {
            throw new IllegalArgumentException("Invoice amount is required.");
        }
        
        java.math.BigDecimal poTotal = po.getTotalAmount();
        if (poTotal == null) {
            poTotal = java.math.BigDecimal.ZERO;
            if (po.getLineItems() != null) {
                for (com.enterprise.procurement.entity.POLineItem item : po.getLineItems()) {
                    if (item.getUnitPrice() != null && item.getOrderedQty() != null) {
                        poTotal = poTotal.add(item.getUnitPrice().multiply(java.math.BigDecimal.valueOf(item.getOrderedQty())));
                    }
                }
            }
        }
        
        if (poTotal != null && invoice.getAmount().compareTo(poTotal) > 0) {
            System.out.println("THROWING EXCEPTION: Invoice amount " + invoice.getAmount() + " exceeds Purchase Order total amount " + poTotal);
            throw new IllegalArgumentException("Invoice amount exceeds Purchase Order total amount.");
        }
        
        invoice.setPurchaseOrder(po);
        invoice.setStatus("PENDING");
        Invoice saved = save(invoice);

        com.enterprise.procurement.entity.AuditLog audit = com.enterprise.procurement.entity.AuditLog.builder()
                .user(po.getRequisition().getCreatedBy())
                .module("Invoice")
                .action("UPLOAD")
                .entityName("Invoice")
                .entityId(saved.getInvoiceId())
                .remarks("Invoice " + saved.getInvoiceNumber() + " uploaded for PO " + po.getPoNumber())
                .build();
        auditLogRepository.save(audit);

        notificationService.createNotification(
                po.getRequisition().getCreatedBy().getUsername(),
                "Invoice Uploaded",
                "Invoice " + saved.getInvoiceNumber() + " has been uploaded for your PO.",
                "Invoice",
                saved.getInvoiceId()
        );

        return saved;
    }

    @Transactional
    public Invoice verifyInvoice(Long invoiceId, String username, String action) {
        Invoice invoice = findById(invoiceId);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        if ("VERIFY".equalsIgnoreCase(action)) {
            invoice.setStatus("VERIFIED");
            invoice.setVerifiedBy(user);
        } else if ("REJECT".equalsIgnoreCase(action)) {
            invoice.setStatus("REJECTED");
            invoice.setVerifiedBy(user);
        } else {
            throw new IllegalArgumentException("Action must be VERIFY or REJECT");
        }
        
        Invoice saved = save(invoice);
        
        com.enterprise.procurement.entity.AuditLog audit = com.enterprise.procurement.entity.AuditLog.builder()
                .user(user)
                .module("Invoice")
                .action(action.toUpperCase())
                .entityName("Invoice")
                .entityId(saved.getInvoiceId())
                .remarks("Invoice " + saved.getInvoiceNumber() + " was " + saved.getStatus())
                .build();
        auditLogRepository.save(audit);

        notificationService.createNotification(
                saved.getPurchaseOrder().getRequisition().getCreatedBy().getUsername(),
                "Invoice " + saved.getStatus(),
                "Invoice " + saved.getInvoiceNumber() + " has been " + saved.getStatus().toLowerCase() + ".",
                "Invoice",
                saved.getInvoiceId()
        );

        return saved;
    }
}
