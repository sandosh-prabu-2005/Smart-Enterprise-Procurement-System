package com.enterprise.procurement.service;

import com.enterprise.procurement.entity.Invoice;
import com.enterprise.procurement.entity.Payment;
import com.enterprise.procurement.entity.User;
import com.enterprise.procurement.repository.InvoiceRepository;
import com.enterprise.procurement.repository.PaymentRepository;
import com.enterprise.procurement.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.enterprise.procurement.exception.ResourceNotFoundException;
import com.enterprise.procurement.exception.BadRequestException;
import java.util.List;
import java.time.LocalDateTime;

@Service
public class PaymentService extends BaseService<Payment, Long> {

    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;
    private final com.enterprise.procurement.repository.AuditLogRepository auditLogRepository;
    private final NotificationService notificationService;
    private final com.enterprise.procurement.repository.PurchaseOrderRepository purchaseOrderRepository;

    public PaymentService(PaymentRepository repository,
                          InvoiceRepository invoiceRepository,
                          UserRepository userRepository,
                          com.enterprise.procurement.repository.AuditLogRepository auditLogRepository,
                          NotificationService notificationService,
                          com.enterprise.procurement.repository.PurchaseOrderRepository purchaseOrderRepository) {
        super(repository);
        this.invoiceRepository = invoiceRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationService = notificationService;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    public List<Payment> findByInvoiceId(Long invoiceId) {
        return ((PaymentRepository) repository).findByInvoice_InvoiceId(invoiceId);
    }

    @Transactional
    public Payment createPayment(Payment payment, Long invoiceId, String username) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));
        
        if (!"VERIFIED".equalsIgnoreCase(invoice.getStatus())) {
            throw new BadRequestException("Can only pay verified invoices.");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        payment.setInvoice(invoice);
        payment.setPaidBy(user);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setStatus("COMPLETED");
        Payment saved = save(payment);
        
        // Finalize PO
        com.enterprise.procurement.entity.PurchaseOrder po = invoice.getPurchaseOrder();
        po.setStatus("CLOSED");
        po.setStage("CLOSED");
        purchaseOrderRepository.save(po);

        com.enterprise.procurement.entity.AuditLog audit = com.enterprise.procurement.entity.AuditLog.builder()
                .user(user)
                .module("Payment")
                .action("PAYMENT_COMPLETED")
                .entityName("Payment")
                .entityId(saved.getPaymentId())
                .remarks("Payment " + saved.getPaymentReference() + " completed for Invoice " + invoice.getInvoiceNumber())
                .build();
        auditLogRepository.save(audit);

        notificationService.createNotification(
                po.getRequisition().getCreatedBy().getUsername(),
                "Payment Completed",
                "Payment for your PO " + po.getPoNumber() + " has been successfully completed. Transaction is now closed.",
                "Payment",
                po.getPoId()
        );

        return saved;
    }
}
