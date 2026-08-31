package com.enterprise.procurement.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "po_receipts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class POReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "receipt_id")
    private Long receiptId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @Column(name = "description")
    private String description;

    @Column(name = "qty_received")
    private Integer qtyReceived;

    @Column(name = "received_date")
    private LocalDate receivedDate;

    @Column(name = "damaged_qty")
    private Integer damagedQty;

    @Column(name = "item_condition")
    private String itemCondition;

    @Column(name = "warehouse")
    private String warehouse;

    @Column(name = "remarks", length = 1000)
    private String remarks;

    @Column(name = "status")
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "received_by")
    private User receivedBy;
}
