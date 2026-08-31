import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiFetch } from "../../api";
import "./POTracker.css";
import PODetail from "./PODetail";
import EnterpriseTable from "../../components/EnterpriseTable";

function POTracker({ user }) {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await apiFetch("/api/purchase-orders", {}, user.token);
        setOrders(data);
      } catch {
        setError("Failed to load purchase orders.");
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [user.token, location.key]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredOrders = orders.filter((order) => {
    return statusFilter === 'ALL' || order.status === statusFilter || order.stage === statusFilter;
  });

  async function loadOrderDetail(po) {
    setLoadingDetail(true);
    try {
      const [lineItemsData, receiptsData] = await Promise.all([
        apiFetch("/api/po-line-items", {}, user.token),
        apiFetch("/api/po-receipts", {}, user.token),
      ]);

      const filteredItems = lineItemsData
        .filter((item) => item.purchaseOrder?.poId === po.poId)
        .map((item) => ({
          description: item.description,
          ordered: item.orderedQty,
          received: item.receivedQty || 0,
          unitPrice: item.unitPrice,
        }));

      const filteredReceipts = receiptsData
        .filter((rec) => rec.purchaseOrder?.poId === po.poId)
        .sort((a, b) => new Date(a.receivedDate) - new Date(b.receivedDate))
        .map((rec) => ({
          date: rec.receivedDate,
          description: rec.description,
          qty: rec.qtyReceived,
        }));

      setSelectedOrder({
        poId: po.poId,
        id: po.poNumber,
        vendor: po.supplier?.supplierName || "—",
        created: po.createdDate,
        total: po.requisition?.totalAmount || 0,
        stage: po.stage,
        items: filteredItems,
        receipts: filteredReceipts,
      });
    } catch {
      alert("Failed to load purchase order details.");
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleRecordReceipt(poId, receiptData) {
    try {
      const payload = {
        poId: poId,
        description: receiptData.description,
        qtyReceived: parseInt(receiptData.qty),
        damagedQty: parseInt(receiptData.damagedQty) || 0,
        itemCondition: receiptData.condition || "Good",
        warehouse: receiptData.warehouse || "Default",
        remarks: receiptData.remarks || "Recorded by Requester",
        receivedDate: new Date().toISOString().slice(0, 10),
      };

      await apiFetch(
        "/api/po-receipts",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        user.token
      );

      // reload PO details
      const poObj = orders.find((o) => o.poId === poId);
      if (poObj) {
        await loadOrderDetail(poObj);
      }
    } catch (err) {
      alert(err.message || "Failed to record receipt.");
    }
  }

  async function handleStatusChange(poId, newStatus) {
    try {
      await apiFetch(`/api/purchase-orders/${poId}/supplier-status?status=${newStatus}`, { method: "PUT" }, user.token);
      
      const updatedList = await apiFetch("/api/purchase-orders", {}, user.token);
      setOrders(updatedList);
      
      const updatedPo = updatedList.find(o => o.poId === poId);
      if (updatedPo) {
        await loadOrderDetail(updatedPo);
      }
    } catch (err) {
      console.error("Failed to update PO status:", err);
      alert("Failed to update status.");
    }
  }

  if (selectedOrder !== null) {
    return (
      <PODetail
        order={selectedOrder}
        onRecordReceipt={handleRecordReceipt}
        onStatusChange={handleStatusChange}
        onBack={() => setSelectedOrder(null)}
        user={user}
      />
    );
  }

  const headers = [
    { field: 'poNumber', label: 'PO #' },
    { field: 'supplier.supplierName', label: 'Vendor' },
    { field: 'createdDate', label: 'Created' },
    {
      field: 'total',
      label: 'Total Amount',
      align: 'right',
      render: (row) => `₹ ${(row.requisition?.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    {
      field: 'stage',
      label: 'Stage',
      render: (row) => (
        <span className={`status-badge status-${(row.stage || 'CREATED').toLowerCase().replace(/_/g, '-')}`}>
          {row.stage}
        </span>
      )
    }
  ];

  return (
    <div className="po-page">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' }}>Purchase Orders</h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Manage and track corporate vendor distributions and delivery stages</p>
      </div>

      {error && <p className="po-error" style={{ color: "red" }}>{error}</p>}
      {loadingDetail && <p style={{ color: "var(--primary-color)" }}>Loading details...</p>}

      {/* Controls Container */}
      <div className="po-controls" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px', justifyContent: 'flex-end' }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: 'white', outline: 'none' }}
        >
          <option value="ALL">All Delivery Statuses</option>
          <option value="CREATED">Created</option>
          <option value="PARTIALLY_DELIVERED">Partially Delivered</option>
          <option value="FULLY_DELIVERED">Fully Delivered</option>
        </select>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: "1.5rem", color: '#6b7280' }}>Loading purchase orders...</p>
        ) : (
          <EnterpriseTable
            headers={headers}
            data={filteredOrders}
            itemsPerPage={8}
            onRowClick={(row) => loadOrderDetail(row)}
            emptyMessage="No purchase orders found."
          />
        )}
      </div>
    </div>
  );
}

export default POTracker;