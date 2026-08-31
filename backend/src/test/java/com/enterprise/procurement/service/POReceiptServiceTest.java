package com.enterprise.procurement.service;

import com.enterprise.procurement.entity.POLineItem;
import com.enterprise.procurement.entity.POReceipt;
import com.enterprise.procurement.entity.PurchaseOrder;
import com.enterprise.procurement.repository.POReceiptRepository;
import com.enterprise.procurement.repository.PurchaseOrderRepository;
import com.enterprise.procurement.repository.UserRepository;
import com.enterprise.procurement.repository.AuditLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class POReceiptServiceTest {

    @Mock
    private POReceiptRepository repository;

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private POReceiptService poReceiptService;

    private PurchaseOrder purchaseOrder;
    private POLineItem lineItem1;

    @BeforeEach
    void setUp() {
        purchaseOrder = PurchaseOrder.builder()
                .poId(1L)
                .poNumber("PO-2026-001")
                .status("CREATED")
                .stage("CREATED")
                .build();

        lineItem1 = POLineItem.builder()
                .poLineItemId(10L)
                .purchaseOrder(purchaseOrder)
                .description("Laptops")
                .orderedQty(10)
                .receivedQty(0)
                .unitPrice(new BigDecimal("1000.00"))
                .build();

        purchaseOrder.setLineItems(List.of(lineItem1));
    }

    @Test
    void saveReceipt_PartialDelivery_UpdatesPOStatusToPartiallyDelivered() {
        POReceipt receipt = POReceipt.builder()
                .receiptId(100L)
                .purchaseOrder(purchaseOrder)
                .description("Laptops")
                .qtyReceived(4)
                .build();

        when(repository.save(any(POReceipt.class))).thenReturn(receipt);
        when(purchaseOrderRepository.findById(1L)).thenReturn(Optional.of(purchaseOrder));
        when(repository.findByPurchaseOrder_PoId(1L)).thenReturn(List.of(receipt));

        POReceipt result = poReceiptService.save(receipt);

        assertEquals("PARTIALLY_DELIVERED", purchaseOrder.getStatus());
        verify(purchaseOrderRepository).save(purchaseOrder);
    }
}
