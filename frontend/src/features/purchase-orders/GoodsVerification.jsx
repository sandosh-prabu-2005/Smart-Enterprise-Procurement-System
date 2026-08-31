import { useState, useEffect } from 'react';
import { apiFetch } from '../../api';

export default function GoodsVerification({ user }) {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReceipts = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/po-receipts', {}, user.token);
      setReceipts(data);
    } catch (err) {
      console.error('Failed to load receipts:', err);
      setError('Failed to load receipts.');
    } finally {
      setLoading(false);
    }
  };

  // loadReceipts is redefined every render; only re-fetch when the token changes.
  useEffect(() => {
    loadReceipts();
  }, [user.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVerify = async (receiptId, status) => {
    try {
      const receiptToUpdate = receipts.find(r => r.receiptId === receiptId);
      if (!receiptToUpdate) return;
      
      const payload = { ...receiptToUpdate, status: status };
      await apiFetch(`/api/po-receipts/${receiptId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }, user.token);
      
      alert(`Receipt ${status} successfully!`);
      loadReceipts();
    } catch (err) {
      console.error('Failed to update receipt status:', err);
      alert('Failed to update receipt status.');
    }
  };

  const pendingVerification = receipts.filter(r => r.status === 'PENDING_VERIFICATION');
  const completedVerifications = receipts.filter(r => r.status !== 'PENDING_VERIFICATION');

  if (loading) return <div style={{ padding: '24px' }}>Loading...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--color-black)' }}>Goods Verification</h1>
      <p style={{ color: 'var(--color-gray-dark)', marginBottom: '24px' }}>Review and verify incoming deliveries before finalizing Goods Receipt Notes (GRN).</p>

      {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}

      <div className="zoho-card" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px' }}>Pending Verification</h3>
        {pendingVerification.length === 0 ? (
          <p style={{ color: 'var(--color-gray)' }}>No receipts pending verification.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px' }}>PO Number</th>
                <th style={{ padding: '12px' }}>Description</th>
                <th style={{ padding: '12px' }}>Received Qty</th>
                <th style={{ padding: '12px' }}>Damaged Qty</th>
                <th style={{ padding: '12px' }}>Condition</th>
                <th style={{ padding: '12px' }}>Warehouse</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingVerification.map(r => (
                <tr key={r.receiptId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{r.purchaseOrder?.poNumber}</td>
                  <td style={{ padding: '12px' }}>{r.description}</td>
                  <td style={{ padding: '12px' }}>{r.qtyReceived}</td>
                  <td style={{ padding: '12px', color: r.damagedQty > 0 ? '#b91c1c' : 'inherit' }}>{r.damagedQty || 0}</td>
                  <td style={{ padding: '12px' }}>{r.itemCondition || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>{r.warehouse || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => handleVerify(r.receiptId, 'VERIFIED_ACCEPTED')} className="btn-enterprise primary" style={{ marginRight: '8px' }}>Accept</button>
                    <button onClick={() => handleVerify(r.receiptId, 'VERIFIED_REJECTED')} className="btn-enterprise" style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', padding: '6px 16px', borderRadius: '4px' }}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="zoho-card" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px' }}>Verification History</h3>
        {completedVerifications.length === 0 ? (
          <p style={{ color: 'var(--color-gray)' }}>No history found.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px' }}>PO Number</th>
                <th style={{ padding: '12px' }}>Description</th>
                <th style={{ padding: '12px' }}>Received Qty</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {completedVerifications.map(r => (
                <tr key={r.receiptId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{r.purchaseOrder?.poNumber}</td>
                  <td style={{ padding: '12px' }}>{r.description}</td>
                  <td style={{ padding: '12px' }}>{r.qtyReceived}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500',
                      backgroundColor: r.status === 'VERIFIED_ACCEPTED' ? '#dcfce7' : '#fee2e2',
                      color: r.status === 'VERIFIED_ACCEPTED' ? '#166534' : '#991b1b'
                    }}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}