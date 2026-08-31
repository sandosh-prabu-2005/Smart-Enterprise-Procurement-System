import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiFetch } from "../../api";
import { renderStatusBadge } from "../../utils/statusBadge";
import EnterpriseTable from "../../components/EnterpriseTable";
import RequestDetail from "./RequestDetail";
import "./MyRequests.css";

export default function MyRequests({ user }) {
  const location = useLocation();

  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    async function loadRequests() {
      try {
        const data = await apiFetch("/api/requisitions/my", {}, user.token);
        setMyRequests(data);
      } catch {
        setError("Failed to load your purchase requests.");
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, [user.token, location.key]);

  async function handleRowClick(r) {
    setLoadingDetail(true);
    try {
      const [itemsData, historyData] = await Promise.all([
        apiFetch("/api/requisition-line-items", {}, user.token),
        apiFetch("/api/requisition-history", {}, user.token),
      ]);

      const filteredItems = itemsData
        .filter((item) => item.requisition?.requisitionId === r.requisitionId)
        .map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }));

      const filteredHistory = historyData
        .filter((h) => h.requisition?.requisitionId === r.requisitionId)
        .sort((a, b) => new Date(a.actionDate) - new Date(b.actionDate))
        .map((h) => ({
          step: h.step,
          actionedBy: h.actionBy?.fullName || h.actionBy?.username || 'System',
          remarks: h.remarks,
          date: h.actionDate ? new Date(h.actionDate).toLocaleDateString() : null,
        }));

      setSelectedRequest({
        requisitionId: r.requisitionId,
        id: r.requisitionNumber,
        title: r.title,
        status: r.status,
        items: filteredItems,
        history: filteredHistory,
      });
    } catch {
      alert("Failed to load request details.");
    } finally {
      setLoadingDetail(false);
    }
  }

  if (selectedRequest !== null) {
    return (
      <RequestDetail
        request={selectedRequest}
        onBack={() => setSelectedRequest(null)}
        user={user}
      />
    );
  }

  const filteredRequests = myRequests.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || (r.priority || 'MEDIUM') === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const tableHeaders = [
    { label: "PR Number", field: "requisitionNumber" },
    { label: "Subject / Title", field: "title" },
    { label: "Needed By Date", field: "neededBy" },
    { 
      label: "Estimated Total", 
      field: "totalAmount", 
      align: "right",
      render: (row, val) => `₹ ${(val || 0).toLocaleString()}`
    },
    { 
      label: "Status Label", 
      field: "status",
      render: (row, val) => renderStatusBadge(val)
    }
  ];

  return (
    <div className="myreq-page" style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">My Purchase Requests</h1>
        <p className="page-subtext">Requests you have submitted so far for approvals</p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {loadingDetail && (
        <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', fontWeight: '600' }}>
          Compiling requisition details data...
        </div>
      )}

      {/* Controls Container */}
      <div className="myreq-controls" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px', justifyContent: 'flex-end' }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px', backgroundColor: 'white', outline: 'none' }}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="APPROVED">Approved</option>
          <option value="ORDER_CREATED">Order Created</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '13px', backgroundColor: 'white', outline: 'none' }}
        >
          <option value="ALL">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {/* Enterprise Table layout */}
      <div className="zoho-card" style={{ padding: '0', overflow: 'hidden', border: 'none' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Gathering requests database entries...</p>
          </div>
        ) : (
          <EnterpriseTable
            headers={tableHeaders}
            data={filteredRequests}
            itemsPerPage={10}
            onRowClick={(row) => handleRowClick(row)}
            emptyMessage="No purchase requests found."
            exportFilename="my_purchase_requests.csv"
          />
        )}
      </div>
    </div>
  );
}