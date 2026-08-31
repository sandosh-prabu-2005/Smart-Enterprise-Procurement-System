import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiFetch } from "../../api";
import { UploadCloud, DollarSign } from "lucide-react";

export default function FinancePayments({ user }) {
  const location = useLocation();
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' or 'payments'

  // Invoice Upload State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    poId: "",
    invoiceNumber: "",
    invoiceDate: "",
    amount: "",
    taxAmount: "",
  });

  // loadData is redefined every render; only re-fetch when the token changes.
  useEffect(() => {
    loadData();
  }, [user.token, location.key]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    setLoading(true);
    try {
      const [invs, pmts, pos] = await Promise.all([
        apiFetch("/api/invoices", {}, user.token),
        apiFetch("/api/payments", {}, user.token),
        apiFetch("/api/purchase-orders", {}, user.token),
      ]);
      setInvoices(invs);
      setPayments(pmts);
      setPurchaseOrders(pos.filter(po => po.status !== 'CANCELLED'));
    } catch {
      setError("Failed to load financial records.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyInvoice(invoiceId) {
    try {
      await apiFetch(`/api/invoices/${invoiceId}/action?action=VERIFY`, { method: "POST" }, user.token);
      loadData();
    } catch {
      alert("Failed to verify invoice.");
    }
  }

  async function handleCreatePayment(invoiceId) {
    const method = prompt("Enter Payment Method (e.g. Wire Transfer, Cheque):", "Wire Transfer");
    const ref = prompt("Enter Payment Reference Number:", "TXN-" + Math.floor(Math.random()*100000));
    
    if (!method || !ref) return;

    try {
      await apiFetch(`/api/payments/${invoiceId}`, {
        method: "POST",
        body: JSON.stringify({
          paymentMethod: method,
          referenceNumber: ref
        })
      }, user.token);
      loadData();
      alert("Payment processed successfully.");
    } catch (err) {
      console.error("Payment processing failed:", err);
      alert("Failed to process payment.");
    }
  }

  async function handleUploadInvoice(e) {
    e.preventDefault();
    if (!newInvoice.poId || !newInvoice.invoiceNumber) return;

    try {
      await apiFetch(`/api/invoices/upload/${newInvoice.poId}`, {
        method: "POST",
        body: JSON.stringify({
          invoiceNumber: newInvoice.invoiceNumber,
          invoiceDate: newInvoice.invoiceDate,
          amount: parseFloat(newInvoice.amount),
          taxAmount: parseFloat(newInvoice.taxAmount),
        })
      }, user.token);
      setShowInvoiceModal(false);
      loadData();
    } catch {
      alert("Failed to upload invoice.");
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
        Loading financial data...
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", fontFamily: "var(--font-body)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", margin: "0 0 8px 0" }}>Financial Control Center</h1>
          <p style={{ color: "#6b7280", margin: 0 }}>Process vendor invoices and authorize disbursements.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`btn-enterprise ${activeTab === 'invoices' ? 'primary' : 'secondary'}`}
            style={{ height: '40px' }}
          >
            Invoices Queue
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`btn-enterprise ${activeTab === 'payments' ? 'primary' : 'secondary'}`}
            style={{ height: '40px' }}
          >
            Payment History
          </button>
        </div>
      </div>

      {error && <div style={{ color: "red", marginBottom: "16px" }}>{error}</div>}

      {activeTab === 'invoices' && (
        <div className="zoho-card" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3>Vendor Invoices</h3>
            <button onClick={() => setShowInvoiceModal(true)} className="btn-enterprise primary" style={{ height: '36px' }}>
              <UploadCloud size={16} /> Upload Invoice
            </button>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px' }}>Invoice #</th>
                <th style={{ padding: '12px' }}>PO #</th>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No invoices found.</td></tr>
              ) : invoices.map(inv => (
                <tr key={inv.invoiceId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px' }}><strong>{inv.invoiceNumber}</strong></td>
                  <td style={{ padding: '12px', color: 'var(--primary-color)' }}>{inv.purchaseOrder?.poNumber}</td>
                  <td style={{ padding: '12px' }}>{inv.invoiceDate}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>₹{(inv.amount || 0).toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`status-pill ${inv.status.toLowerCase().replace('_', '-')}`}>{inv.status}</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {inv.status === 'PENDING_VERIFICATION' && (
                      <button onClick={() => handleVerifyInvoice(inv.invoiceId)} className="btn-enterprise secondary" style={{ height: '32px', fontSize: '12px', padding: '0 12px' }}>
                        Verify
                      </button>
                    )}
                    {inv.status === 'VERIFIED' && (
                      <button onClick={() => handleCreatePayment(inv.invoiceId)} className="btn-enterprise primary" style={{ height: '32px', fontSize: '12px', padding: '0 12px' }}>
                        <DollarSign size={14} /> Pay
                      </button>
                    )}
                    {inv.status === 'PAID' && <span style={{ color: '#16a34a', fontSize: '13px', fontWeight: '500' }}>Cleared</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="zoho-card" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '16px' }}>Payment Register</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px' }}>Transaction ID</th>
                <th style={{ padding: '12px' }}>Invoice Ref</th>
                <th style={{ padding: '12px' }}>Date Processed</th>
                <th style={{ padding: '12px' }}>Method</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Amount Paid</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No payments recorded.</td></tr>
              ) : payments.map(pmt => (
                <tr key={pmt.paymentId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px' }}><strong>{pmt.referenceNumber}</strong></td>
                  <td style={{ padding: '12px' }}>{pmt.invoice?.invoiceNumber}</td>
                  <td style={{ padding: '12px' }}>{pmt.paymentDate}</td>
                  <td style={{ padding: '12px' }}>{pmt.paymentMethod}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>₹{(pmt.amount || 0).toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>
                    <span className="status-pill completed">{pmt.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showInvoiceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Upload Invoice Document</h3>
            <form onSubmit={handleUploadInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Purchase Order *</label>
                <select className="zoho-input" required value={newInvoice.poId} onChange={e => setNewInvoice({...newInvoice, poId: e.target.value})}>
                  <option value="">Select PO</option>
                  {purchaseOrders.map(po => (
                    <option key={po.poId} value={po.poId}>{po.poNumber} - {po.supplier?.supplierName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Invoice Number *</label>
                <input className="zoho-input" required type="text" value={newInvoice.invoiceNumber} onChange={e => setNewInvoice({...newInvoice, invoiceNumber: e.target.value})} placeholder="INV-2026-..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Invoice Date *</label>
                <input className="zoho-input" required type="date" value={newInvoice.invoiceDate} onChange={e => setNewInvoice({...newInvoice, invoiceDate: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Base Amount *</label>
                  <input className="zoho-input" required type="number" step="0.01" value={newInvoice.amount} onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})} placeholder="0.00" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>Tax Amount</label>
                  <input className="zoho-input" type="number" step="0.01" value={newInvoice.taxAmount} onChange={e => setNewInvoice({...newInvoice, taxAmount: e.target.value})} placeholder="0.00" />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowInvoiceModal(false)} className="btn-enterprise secondary">Cancel</button>
                <button type="submit" className="btn-enterprise primary">Upload Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}