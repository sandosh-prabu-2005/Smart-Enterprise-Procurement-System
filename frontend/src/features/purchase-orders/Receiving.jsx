import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiFetch } from "../../api";
import { Clock } from "lucide-react";
import EnterpriseTable from "../../components/EnterpriseTable";
import PODetail from "./PODetail";
import "./Receiving.css";

export default function Receiving({ user }) {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await apiFetch("/api/purchase-orders", {}, user.token);
        // show active orders awaiting deliveries
        const activeOrders = data.filter((o) => o.status !== "FULLY_DELIVERED");
        setOrders(activeOrders);
      } catch {
        setError("Failed to load purchase orders.");
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [user.token, location.key]);

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
        itemCondition: receiptData.condition,
        warehouse: receiptData.warehouse,
        remarks: receiptData.remarks,
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

      // reload Po list to verify if it has transitioned to fully delivered
      const updatedList = await apiFetch("/api/purchase-orders", {}, user.token);
      setOrders(updatedList.filter((o) => o.status !== "FULLY_DELIVERED"));
    } catch (err) {
      alert(err.message || "Failed to record receipt.");
    }
  }

  if (selectedOrder !== null) {
    return (
      <PODetail
        order={selectedOrder}
        onRecordReceipt={handleRecordReceipt}
        onBack={() => setSelectedOrder(null)}
      />
    );
  }

  const tableHeaders = [
    { label: "PO Number", field: "poNumber" },
    { label: "Vendor Partner", field: "supplier.supplierName" },
    { label: "Date Issued", field: "createdDate" },
    { 
      label: "Order Total", 
      field: "requisition.totalAmount", 
      align: "right",
      render: (row, val) => `₹ ${(val || 0).toLocaleString()}`
    },
    { 
      label: "Fulfillment Stage", 
      field: "stage",
      render: (row, val) => (
        <span className={`status-pill ${String(val).toLowerCase() === 'fully_delivered' ? 'approved' : String(val).toLowerCase() === 'partially_delivered' ? 'pending' : 'po-generated'}`}>
          {val}
        </span>
      )
    }
  ];

  return (
    <div className="recv-page" style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Warehouse Receiving Desk</h1>
        <p className="page-subtext">Log shipment deliveries against active open purchase orders</p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {loadingDetail && (
        <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', fontWeight: '600' }}>
          Compiling purchase order documents...
        </div>
      )}

      {/* Metrics Row */}
      <div className="dash-stats-grid" style={{ gridTemplateColumns: '300px 1fr', marginBottom: '28px' }}>
        <div className="dash-stat-card border-pending">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Awaiting Receipts</span>
            <Clock size={20} style={{ color: 'var(--color-pending)' }} />
          </div>
          <strong>{orders.length}</strong>
          <span className="trend-text" style={{ color: '#6b7280' }}>Open Purchase Orders</span>
        </div>
      </div>

      {/* Enterprise Table component */}
      <div className="zoho-card" style={{ padding: '0', overflow: 'hidden', border: 'none' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Gathering active orders...</p>
          </div>
        ) : (
          <EnterpriseTable
            headers={tableHeaders}
            data={orders}
            itemsPerPage={10}
            onRowClick={(row) => loadOrderDetail(row)}
            emptyMessage="No pending orders awaiting physical receipt."
            exportFilename="receiving_queue.csv"
          />
        )}
      </div>
    </div>
  );
}