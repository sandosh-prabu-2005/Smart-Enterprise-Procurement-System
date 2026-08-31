import { useState } from "react";
import { Printer, Download, ArrowLeft, Check, AlertCircle } from "lucide-react";
import erpLogo from "../../assets/logos/erplogo.png";
import "./PODetail.css";

export default function PODetail({ order, onRecordReceipt, onBack, onStatusChange, user }) {
  const [receiveInputs, setReceiveInputs] = useState({});

  const items = order.items || [];
  const receipts = order.receipts || [];

  function handleInputChange(index, value) {
    setReceiveInputs({ ...receiveInputs, [index]: value });
  }

  function recordReceipt(index) {
    const qty = parseFloat(receiveInputs[index]);
    const outstanding = items[index].ordered - (items[index].received || 0);
    if (!qty || qty <= 0) {
      return;
    }
    if (qty > outstanding) {
      alert(`Cannot receive ${qty} units — only ${outstanding} unit(s) are outstanding for this line item.`);
      return;
    }

    const damagedQty = window.prompt("Enter Damaged Quantity (if any):", "0");
    if (damagedQty === null) return;

    const condition = window.prompt("Enter Condition (e.g. Good, Damaged):", "Good");
    if (condition === null) return;

    const warehouse = window.prompt("Enter Delivery Warehouse/Location:", "Main Warehouse");
    if (warehouse === null) return;
    
    const remarks = window.prompt("Enter Remarks/Delivery Note:", "Delivered on schedule");
    if (remarks === null) return;

    onRecordReceipt(order.poId, {
      description: items[index].description,
      qty: qty,
      damagedQty: damagedQty,
      condition: condition,
      warehouse: warehouse,
      remarks: remarks
    });
    setReceiveInputs({ ...receiveInputs, [index]: "" });
  }

  const poTotal = order.total || 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pod-page-container" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Top action controls */}
      <div className="pod-actions-bar no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <button className="btn-enterprise secondary" onClick={onBack} style={{ height: '40px' }}>
          <ArrowLeft size={16} />
          <span>Back to Purchase Orders</span>
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-enterprise secondary" onClick={handlePrint} style={{ height: '40px' }}>
            <Printer size={16} />
            <span>Print PO</span>
          </button>
          <button className="btn-enterprise primary" onClick={handlePrint} style={{ height: '40px' }}>
            <Download size={16} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {user?.role === 'Admin' && (
        <div className="pod-admin-actions no-print" style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: 'var(--bg-color)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: 0, alignSelf: 'center', marginRight: '16px', fontSize: '14px' }}>Admin Lifecycle Actions:</h4>
          {order.stage === 'CREATED' && (
            <button className="btn-enterprise secondary" onClick={() => onStatusChange(order.poId, 'SENT_TO_SUPPLIER')}>
              Send to Supplier
            </button>
          )}
          {order.stage === 'SENT_TO_SUPPLIER' && (
            <button className="btn-enterprise secondary" onClick={() => onStatusChange(order.poId, 'SUPPLIER_ACCEPTED')}>
              Mark Supplier Accepted
            </button>
          )}
          {order.stage === 'SUPPLIER_ACCEPTED' && (
            <button className="btn-enterprise secondary" onClick={() => onStatusChange(order.poId, 'IN_TRANSIT')}>
              Mark In Transit
            </button>
          )}
        </div>
      )}

      {/* Invoice Sheet */}
      <div className="pod-invoice-card printable-area">
        {/* Invoice Header */}
        <div className="pod-invoice-header">
          <div className="pod-company-details">
            <img 
              src={erpLogo} 
              alt="ERP Logo" 
              style={{ maxHeight: '48px', objectFit: 'contain', marginBottom: '12px' }} 
            />
            <h2 className="logo-title-font" style={{ fontSize: '18px', color: 'var(--color-black)', margin: '0 0 6px 0' }}>
              Enterprise Procurement Corp
            </h2>
            <p style={{ color: '#4b5563', fontSize: '12.5px' }}>100 Corporate Parkway, Tech City Campus</p>
            <p style={{ color: '#4b5563', fontSize: '12.5px' }}>finance@enterprise.com | +1 (555) 0199</p>
          </div>
          
          <div className="pod-invoice-meta" style={{ textAlign: 'right' }}>
            <h1 className="logo-title-font" style={{ fontSize: '26px', color: 'var(--primary-color)', margin: '0 0 12px 0' }}>
              PURCHASE ORDER
            </h1>
            <div style={{ fontSize: '13px', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
              <span><strong>PO Number:</strong> {order.id}</span>
              <span><strong>Date Issued:</strong> {order.created}</span>
              <span>
                <strong>Fulfillment Stage:</strong>{" "}
                <span className={`status-pill ${(order.stage || 'CREATED').toLowerCase().replace(/_/g, '-')}`} style={{ display: 'inline-flex', verticalAlign: 'middle', marginLeft: '4px' }}>
                  {order.stage}
                </span>
              </span>
            </div>
          </div>
        </div>

        <hr className="pod-divider" style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />

        {/* Addresses */}
        <div className="pod-addresses-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
          <div className="pod-address-block">
            <h3 style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
              Vendor / Supplier partner
            </h3>
            <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-black)', marginBottom: '4px' }}>{order.vendor}</p>
            <p style={{ color: '#4b5563', fontSize: '13px' }}>Authorized Corporate Supplier</p>
            <p style={{ color: '#4b5563', fontSize: '13px' }}>Fulfillment & Logistics Unit</p>
          </div>
          
          <div className="pod-address-block">
            <h3 style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
              Ship To Destination
            </h3>
            <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-black)', marginBottom: '4px' }}>Central Warehouse Dock B</p>
            <p style={{ color: '#4b5563', fontSize: '13px' }}>Tech City Campus, Delivery Zone 4</p>
            <p style={{ color: '#4b5563', fontSize: '13px' }}>Shipment Receiving Dock B</p>
          </div>
        </div>

        {/* Ordered items table */}
        <div className="pod-invoice-table-section" style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-black)', marginBottom: '16px' }}>
            Ordered Line Items & Receipt Status
          </h3>
          <table className="pod-invoice-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Item Details & Specifications</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Ordered</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Received</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Outstanding</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Unit Price</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Line Total</th>
                <th className="no-print" style={{ padding: '12px', textAlign: 'center', fontWeight: '600', width: '200px' }}>Delivery Logs</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const outstanding = item.ordered - (item.received || 0);
                const lineTotal = item.ordered * (item.unitPrice || 0);
                return (
                  <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}><strong>{item.description}</strong></td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{item.ordered}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>{item.received || 0}</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: outstanding > 0 ? 'var(--color-pending)' : 'var(--color-approved)', fontWeight: '700' }}>
                      {outstanding}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>₹ {(item.unitPrice || 0).toLocaleString()}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>₹ {lineTotal.toLocaleString()}</td>
                    <td className="no-print" style={{ padding: '12px' }}>
                      {outstanding > 0 ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <input
                            type="number"
                            min="1"
                            max={outstanding}
                            placeholder={`max ${outstanding}`}
                            value={receiveInputs[index] || ""}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            style={{ width: '80px', padding: '5px 8px', fontSize: '12.5px', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }}
                          />
                          <button 
                            className="btn-enterprise primary" 
                            style={{ height: '28px', padding: '0 10px', fontSize: '11px', borderRadius: '4px' }}
                            onClick={() => recordReceipt(index)}
                          >
                            Record Receipt
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-approved)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                          <Check size={14} />
                          <span>Fully Received</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary */}
        <div className="pod-invoice-summary" style={{ display: 'flex', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap' }}>
          <div className="pod-notes-remarks" style={{ flex: 1, minWidth: '240px' }}>
            <h4 style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
              Standard instructions & Terms
            </h4>
            <p style={{ fontSize: '12px', color: '#4b5563', lineHeight: '1.6' }}>
              Please quote PO reference numbers on all delivery invoices and packing slips. Verify unit counts at the warehouse dock during deliveries.
            </p>
          </div>
          
          <div className="pod-summary-table" style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4b5563' }}>
              <span>Subtotal:</span>
              <span>₹ {poTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4b5563' }}>
              <span>Taxes & Duties (0%):</span>
              <span>₹ 0.00</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: 'var(--color-black)' }}>
              <strong>Grand Total:</strong>
              <strong style={{ color: 'var(--primary-color)', fontSize: '18px' }}>₹ {poTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Receipts Log Card */}
      <div className="zoho-card receipt-log-card no-print" style={{ marginTop: "24px" }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          Delivery Receipt History Log
        </h3>
        
        {receipts.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280', fontSize: '13px', padding: '12px 0' }}>
            <AlertCircle size={16} />
            <span>No delivery history slips recorded for this order yet.</span>
          </div>
        ) : (
          <table className="pod-invoice-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>Receipt Slip</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600' }}>Line item Description</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600' }}>Quantity Logged</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600' }}>Logged Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px' }}>#REC-{1000 + index}</td>
                  <td style={{ padding: '12px' }}>{r.description}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}><strong>{r.qty} units</strong></td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280' }}>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}