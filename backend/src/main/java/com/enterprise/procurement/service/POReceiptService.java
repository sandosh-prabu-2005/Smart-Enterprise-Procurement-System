package com.enterprise.procurement.service;

import com.enterprise.procurement.entity.*;
import com.enterprise.procurement.repository.*;
import com.enterprise.procurement.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class POReceiptService extends BaseService<POReceipt, Long> {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final RequisitionRepository requisitionRepository;
    private final RequisitionHistoryRepository requisitionHistoryRepository;
    private final NotificationService notificationService;

    public POReceiptService(
            POReceiptRepository repository,
            PurchaseOrderRepository purchaseOrderRepository,
            UserRepository userRepository,
            AuditLogRepository auditLogRepository,
            RequisitionRepository requisitionRepository,
            RequisitionHistoryRepository requisitionHistoryRepository,
            NotificationService notificationService) {

        super(repository);
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.requisitionRepository = requisitionRepository;
        this.requisitionHistoryRepository = requisitionHistoryRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public POReceipt saveReceipt(
            com.enterprise.procurement.dto.POReceiptCreateRequest request,
            String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with username: " + username));

        if (request.getPoId() == null) {
            throw new IllegalArgumentException(
                    "A purchase order must be specified for this receipt.");
        }

        PurchaseOrder po = purchaseOrderRepository.findById(request.getPoId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Purchase Order not found."));

        POReceipt receipt = new POReceipt();
        receipt.setPurchaseOrder(po);
        receipt.setReceivedBy(user);
        receipt.setDescription(request.getDescription());
        receipt.setQtyReceived(request.getQtyReceived());
        receipt.setReceivedDate(request.getReceivedDate());
        receipt.setDamagedQty(request.getDamagedQty());
        receipt.setItemCondition(request.getItemCondition());
        receipt.setWarehouse(request.getWarehouse());
        receipt.setRemarks(request.getRemarks());
        receipt.setStatus("PENDING_VERIFICATION");

        if (po.getLineItems() != null && receipt.getDescription() != null) {

            List<POReceipt> existingReceipts =
                    ((POReceiptRepository) repository)
                            .findByPurchaseOrder_PoId(po.getPoId());

            for (POLineItem item : po.getLineItems()) {

                if (item.getDescription() != null
                        && item.getDescription()
                        .equalsIgnoreCase(receipt.getDescription())) {

                    int alreadyReceived = existingReceipts.stream()
                            .filter(r ->
                                    r.getDescription() != null
                                    && r.getDescription()
                                    .equalsIgnoreCase(item.getDescription()))
                            .mapToInt(r ->
                                    r.getQtyReceived() != null
                                    ? r.getQtyReceived()
                                    : 0)
                            .sum();

                    int ordered = item.getOrderedQty() != null
                            ? item.getOrderedQty()
                            : 0;

                    int incomingQty = receipt.getQtyReceived() != null
                            ? receipt.getQtyReceived()
                            : 0;

                    int outstanding = ordered - alreadyReceived;

                    if (incomingQty > outstanding) {
                        throw new IllegalArgumentException(
                                "Cannot receive "
                                + incomingQty
                                + " units of \""
                                + item.getDescription()
                                + "\" — only "
                                + outstanding
                                + " unit(s) are outstanding on this Purchase Order.");
                    }

                    break;
                }
            }
        }

        POReceipt saved = save(receipt);

        AuditLog audit = AuditLog.builder()
                .user(user)
                .module("Receiving")
                .action("RECEIVE")
                .entityName("Purchase Order")
                .entityId(saved.getPurchaseOrder().getPoId())
                .remarks(
                        "Received "
                        + saved.getQtyReceived()
                        + " units. Status: "
                        + saved.getStatus()
                        + ". Condition: "
                        + saved.getItemCondition()
                        + ". Damaged: "
                        + saved.getDamagedQty())
                .build();

        auditLogRepository.save(audit);

        notificationService.createNotification(
                saved.getPurchaseOrder()
                        .getRequisition()
                        .getCreatedBy()
                        .getUsername(),
                "Goods Received (Pending Verification)",
                "Goods received for PO "
                + saved.getPurchaseOrder().getPoNumber()
                + " and are pending verification.",
                "Receiving",
                saved.getPurchaseOrder().getPoId()
        );

        return saved;
    }

    @Override
    @Transactional
    public POReceipt save(POReceipt entity) {

        POReceipt savedReceipt = super.save(entity);

        updatePOStatusOnReceiptChange(
                savedReceipt.getPurchaseOrder().getPoId());

        return savedReceipt;
    }

    @Transactional
    public POReceipt update(Long id, POReceipt receipt) {

        POReceipt existing = findById(id);

        existing.setPurchaseOrder(receipt.getPurchaseOrder());
        existing.setDescription(receipt.getDescription());
        existing.setQtyReceived(receipt.getQtyReceived());
        existing.setReceivedDate(receipt.getReceivedDate());
        existing.setReceivedBy(receipt.getReceivedBy());
        existing.setStatus(receipt.getStatus());
        existing.setDamagedQty(receipt.getDamagedQty());
        existing.setItemCondition(receipt.getItemCondition());
        existing.setWarehouse(receipt.getWarehouse());
        existing.setRemarks(receipt.getRemarks());

        POReceipt updated = save(existing);

        updatePOStatusOnReceiptChange(
                updated.getPurchaseOrder().getPoId());

        if (updated.getStatus() != null
                && updated.getStatus().startsWith("VERIFIED")) {

            notificationService.createNotification(
                    updated.getPurchaseOrder()
                            .getRequisition()
                            .getCreatedBy()
                            .getUsername(),
                    "Goods Verification Complete",
                    "Goods for PO "
                    + updated.getPurchaseOrder().getPoNumber()
                    + " have been "
                    + updated.getStatus()
                            .replace("VERIFIED_", "")
                            .toLowerCase()
                    + ".",
                    "Receiving",
                    updated.getPurchaseOrder().getPoId()
            );
        }

        return updated;
    }

    @Override
    @Transactional
    public void delete(Long id) {

        POReceipt existing = findById(id);

        Long poId = existing.getPurchaseOrder().getPoId();

        super.delete(id);

        updatePOStatusOnReceiptChange(poId);
    }

    @Transactional
    public void updatePOStatusOnReceiptChange(Long poId) {

        PurchaseOrder po =
                purchaseOrderRepository.findById(poId).orElse(null);

        if (po == null) {
            return;
        }

        List<POReceipt> receipts =
                ((POReceiptRepository) repository)
                        .findByPurchaseOrder_PoId(poId);

        int totalReceived = receipts.stream()
                .mapToInt(r ->
                        r.getQtyReceived() != null
                        ? r.getQtyReceived()
                        : 0)
                .sum();

        int totalOrdered = 0;

        if (po.getLineItems() != null) {

            totalOrdered = po.getLineItems().stream()
                    .mapToInt(item ->
                            item.getOrderedQty() != null
                            ? item.getOrderedQty()
                            : 0)
                    .sum();

            for (POLineItem item : po.getLineItems()) {

                int itemReceived = receipts.stream()
                        .filter(r ->
                                r.getDescription() != null
                                && r.getDescription()
                                .equalsIgnoreCase(item.getDescription()))
                        .mapToInt(r ->
                                r.getQtyReceived() != null
                                ? r.getQtyReceived()
                                : 0)
                        .sum();

                item.setReceivedQty(itemReceived);
            }
        }

        String newStatus;

        if (receipts.isEmpty() || totalReceived == 0) {

            newStatus = "CREATED";

        } else if (totalOrdered > 0
                && totalReceived >= totalOrdered) {

            newStatus = "FULLY_DELIVERED";

        } else {

            newStatus = "PARTIALLY_DELIVERED";
        }

        /*
         * Update PO status.
         */
        po.setStatus(newStatus);
        po.setStage(newStatus);

        purchaseOrderRepository.save(po);

        /*
         * ==========================================================
         * IMPORTANT FIX
         * ==========================================================
         *
         * When every ordered item has been received,
         * update the original requisition to RECEIVED.
         *
         * The requester screen reads the requisition status.
         */
        if ("FULLY_DELIVERED".equals(newStatus)) {

            Requisition requisition = po.getRequisition();

            if (requisition != null
                    && !RequisitionStatus.RECEIVED
                    .equals(requisition.getStatus())) {

                requisition.setStatus(
                        RequisitionStatus.RECEIVED);

                requisitionRepository.save(requisition);

                /*
                 * Add event to requester's timeline.
                 */
                User receiver = null;

                if (!receipts.isEmpty()) {
                    receiver = receipts.get(receipts.size() - 1)
                            .getReceivedBy();
                }

                if (receiver != null) {

                    RequisitionHistory history =
                            RequisitionHistory.builder()
                                    .requisition(requisition)
                                    .actionBy(receiver)
                                    .step("Goods Received")
                                    .remarks(
                                            "All goods for PO "
                                            + po.getPoNumber()
                                            + " have been received.")
                                    .build();

                    requisitionHistoryRepository.save(history);
                }

                /*
                 * Notify requester.
                 */
                if (requisition.getCreatedBy() != null) {

                    notificationService.createNotification(
                            requisition.getCreatedBy()
                                    .getUsername(),
                            "Goods Fully Received",
                            "All goods for Purchase Order "
                            + po.getPoNumber()
                            + " have been received successfully.",
                            "Receiving",
                            po.getPoId()
                    );
                }
            }
        }
    }
}