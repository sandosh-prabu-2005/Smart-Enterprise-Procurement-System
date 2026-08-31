import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api";
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Building, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  Database
} from "lucide-react";
import "./Dashboard.css";

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionModal, setActionModal] = useState({ isOpen: false, requisitionId: null, actionType: null });
  const [modalRemarks, setModalRemarks] = useState('');
  const [modalError, setModalError] = useState('');
  const [submittingModal, setSubmittingModal] = useState(false);
  
  // Requester state
  const [myRequisitions, setMyRequisitions] = useState([]);
  
  // Manager / Finance state
  const [pendingApprovals, setPendingApprovals] = useState([]);
  
  // Admin state
  const [allRequisitions, setAllRequisitions] = useState([]);
  const [allPOs, setAllPOs] = useState([]);
  const [recentAudits, setRecentAudits] = useState([]);
  
  // Receiver state
  const [receiverPOs, setReceiverPOs] = useState([]);

  // Cost Center (Finance / Admin) state
  const [costCenters, setCostCenters] = useState([]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (user.role === "Requester") {
        const reqs = await apiFetch("/api/requisitions/my", {}, user.token);
        setMyRequisitions(reqs);
      } 
      else if (user.role === "Approver") {
        const pending = await apiFetch("/api/requisitions/pending", {}, user.token);
        setPendingApprovals(pending);
      } 
      else if (user.role === "Finance") {
        const [pending, reqs, ccs] = await Promise.all([
          apiFetch("/api/requisitions/pending", {}, user.token),
          apiFetch("/api/requisitions", {}, user.token),
          apiFetch("/api/cost-centers", {}, user.token),
        ]);
        setPendingApprovals(pending);
        
        const approved = reqs.filter(r => r.status === "APPROVED" || r.status === "ORDER_CREATED" || r.status === "RECEIVED");
        const ALLOCATION_PER_CC = 500000;
        const mappedCCs = ccs.map(cc => {
          const spent = approved
            .filter(r => r.department?.costCenter?.costCenterId === cc.costCenterId)
            .reduce((sum, r) => sum + (r.totalAmount || 0), 0);
          return {
            ...cc,
            allocated: ALLOCATION_PER_CC,
            spent,
            remaining: Math.max(0, ALLOCATION_PER_CC - spent)
          };
        });
        setCostCenters(mappedCCs);
      } 
      else if (user.role === "Goods Receiver") {
        const pos = await apiFetch("/api/purchase-orders", {}, user.token);
        setReceiverPOs(pos);
      } 
      else if (user.role === "Procurement Admin") {
        const [reqs, pos, audits] = await Promise.all([
          apiFetch("/api/requisitions", {}, user.token),
          apiFetch("/api/purchase-orders", {}, user.token),
          apiFetch("/api/audit-logs", {}, user.token),
        ]);
        setAllRequisitions(reqs);
        setAllPOs(pos);
        setRecentAudits(audits.slice(0, 5));
      }
    } catch (err) {
      console.error("Dashboard load failed:", err);
      setError("Unable to load live dashboard statistics. Please try signing in again.");
    } finally {
      setLoading(false);
    }
  }, [user.role, user.token]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  function openActionModal(reqId, type) {
    setActionModal({ isOpen: true, requisitionId: reqId, actionType: type });
    setModalRemarks(type === 'APPROVE' ? 'Approved via dashboard' : '');
    setModalError('');
  }

  async function handleModalConfirm() {
    if (actionModal.actionType === 'REJECT' && !modalRemarks.trim()) {
      setModalError('Remarks are required for rejection.');
      return;
    }
    setSubmittingModal(true);
    setModalError('');
    try {
      await apiFetch(`/api/requisitions/${actionModal.requisitionId}/actions`, {
        method: "POST",
        body: JSON.stringify({ action: actionModal.actionType, remarks: modalRemarks })
      }, user.token);
      setActionModal({ isOpen: false, requisitionId: null, actionType: null });
      loadDashboardData();
    } catch (err) {
      setModalError(err.message || 'Action failed.');
    } finally {
      setSubmittingModal(false);
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p>Loading live procurement workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p style={{ color: "var(--color-rejected)", fontWeight: 600, marginBottom: "16px" }}>{error}</p>
        <button onClick={loadDashboardData} className="btn-enterprise primary">Retry</button>
      </div>
    );
  }

  // ==========================================
  // RENDER DETAILED VIEW PER ROLE
  // ==========================================

  if (user.role === "Requester") {
    const drafts = myRequisitions.filter(r => r.status === "DRAFT").length;
    const pending = myRequisitions.filter(r => r.status === "PENDING_APPROVAL").length;
    const approved = myRequisitions.filter(r => r.status === "APPROVED" || r.status === "ORDER_CREATED" || r.status === "RECEIVED").length;
    const rejected = myRequisitions.filter(r => r.status === "REJECTED").length;

    return (
      <div className="dash-container">
        <div className="dash-header">
          <div>
            <h1>Welcome back, {user.fullName || user.username}</h1>
            <p>Requester Workspace · View your requisitions status and raise new requests</p>
          </div>
          <button className="btn-enterprise primary" onClick={() => navigate("/requisitions/new")}>
            <Plus size={16} />
            <span>New Requisition</span>
          </button>
        </div>

        <div className="dash-stats-grid">
          <div className="dash-stat-card border-draft">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Draft Requests</span>
              <FileText size={20} style={{ color: 'var(--color-info)' }} />
            </div>
            <strong>{drafts}</strong>
            <span className="trend-text" style={{ color: '#6b7280' }}>Stored in drafts list</span>
          </div>
          <div className="dash-stat-card border-pending">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Pending Approval</span>
              <Clock size={20} style={{ color: 'var(--color-pending)' }} />
            </div>
            <strong>{pending}</strong>
            <span className="trend-text">Updates live</span>
          </div>
          <div className="dash-stat-card border-approved">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Approved Requests</span>
              <CheckCircle2 size={20} style={{ color: 'var(--color-approved)' }} />
            </div>
            <strong>{approved}</strong>
            <span className="trend-text">Historically completed</span>
          </div>
          <div className="dash-stat-card border-rejected">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Rejected Requests</span>
              <XCircle size={20} style={{ color: 'var(--color-rejected)' }} />
            </div>
            <strong>{rejected}</strong>
            <span className="trend-text">Denied requisitions</span>
          </div>
        </div>

        <div className="dash-table-card">
          <h2>My Recent Requests</h2>
          <table className="dash-table">
            <thead>
              <tr>
                <th>PR Number</th>
                <th>Title</th>
                <th>Category</th>
                <th>Supplier</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ paddingLeft: '24px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {myRequisitions.slice(0, 5).map(r => (
                <tr key={r.requisitionId}>
                  <td><strong>{r.requisitionNumber}</strong></td>
                  <td>{r.title}</td>
                  <td>{r.category?.categoryName || "N/A"}</td>
                  <td>{r.supplier?.supplierName || "Direct"}</td>
                  <td style={{ textAlign: 'right' }}>₹ {(r.totalAmount || 0).toLocaleString()}</td>
                  <td style={{ paddingLeft: '24px' }}>
                    <span className={`status-pill ${r.status?.toLowerCase() === 'draft' ? 'pending' : r.status?.toLowerCase() === 'pending_approval' ? 'pending' : r.status?.toLowerCase() === 'approved' ? 'approved' : r.status?.toLowerCase() === 'rejected' ? 'rejected' : 'po-generated'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {myRequisitions.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", color: "#6b7280", padding: "1.5rem" }}>
                    No purchase requests submitted yet. Create your first requisition.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (user.role === "Approver") {
    return (
      <div className="dash-container">
        <div className="dash-header">
          <div>
            <h1>Approver Authorization Inbox</h1>
            <p>Approvals Workspace · Review and sign off on purchase requests assigned to your step</p>
          </div>
          <button className="btn-enterprise primary" onClick={() => navigate("/approvals")}>
            <span>Go to Approvals Dashboard</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="dash-stats-grid" style={{ gridTemplateColumns: '320px 1fr' }}>
          <div className="dash-stat-card border-pending">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Awaiting Your Approval</span>
              <AlertCircle size={20} style={{ color: 'var(--color-pending)' }} />
            </div>
            <strong>{pendingApprovals.length}</strong>
            <span className="trend-text trend-up"><TrendingUp size={14} /> Action required</span>
          </div>
        </div>

        <div className="dash-table-card">
          <h2>Pending Approvals Queue</h2>
          <table className="dash-table">
            <thead>
              <tr>
                <th>PR Number</th>
                <th>Requester</th>
                <th>Category</th>
                <th>Department</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map(r => (
                <tr key={r.requisitionId}>
                  <td><strong>{r.requisitionNumber}</strong></td>
                  <td>{r.createdBy?.username}</td>
                  <td>{r.category?.categoryName}</td>
                  <td>{r.department?.departmentName}</td>
                  <td style={{ textAlign: 'right' }}>₹ {(r.totalAmount || 0).toLocaleString()}</td>
                  <td style={{ textAlign: "center" }}>
                    <div className="dash-action-buttons">
                      <button 
                        className="btn-approve" 
                        onClick={() => openActionModal(r.requisitionId, 'APPROVE')}
                        disabled={submittingModal}
                        style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '6px' }}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn-reject" 
                        onClick={() => openActionModal(r.requisitionId, 'REJECT')}
                        disabled={submittingModal}
                        style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendingApprovals.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", color: "#6b7280", padding: "1.5rem" }}>
                    All caught up! No requisitions pending your approval.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Overlay */}
        {actionModal.isOpen && (
          <div className="modal-blur-overlay">
            <div className="zoho-card modal-panel-card" style={{ maxWidth: '420px', border: 'none' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
                Requisition {actionModal.actionType === 'APPROVE' ? 'Approval' : 'Rejection'}
              </h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-black)', marginBottom: '6px' }}>
                  Remarks / Audit Comments {actionModal.actionType === 'REJECT' && <span style={{ color: 'var(--color-rejected)' }}>*</span>}
                </label>
                <textarea
                  rows="3"
                  value={modalRemarks}
                  onChange={(e) => setModalRemarks(e.target.value)}
                  placeholder="Enter remarks..."
                  style={{
                    width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)',
                    fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none'
                  }}
                />
              </div>

              {modalError && (
                <p style={{ color: 'var(--color-rejected)', fontSize: '13px', marginBottom: '16px', fontWeight: '500' }}>⚠️ {modalError}</p>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn-enterprise secondary"
                  style={{ flex: 1, height: '40px' }}
                  onClick={() => setActionModal({ isOpen: false, requisitionId: null, actionType: null })}
                >
                  Cancel
                </button>
                <button
                  className="btn-enterprise primary"
                  style={{ flex: 1, height: '40px', backgroundColor: actionModal.actionType === 'APPROVE' ? 'var(--color-approved)' : 'var(--color-rejected)' }}
                  onClick={handleModalConfirm}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (user.role === "Finance") {
    const totalSpent = costCenters.reduce((sum, cc) => sum + cc.spent, 0);
    const totalAllocated = costCenters.reduce((sum, cc) => sum + cc.allocated, 0);
    const totalRemaining = totalAllocated - totalSpent;

    return (
      <div className="dash-container">
        <div className="dash-header">
          <div>
            <h1>Finance Officer Workspace</h1>
            <p>Finance Dashboard · Manage cost center budgets and sequence approvals</p>
          </div>
        </div>

        <div className="dash-stats-grid">
          <div className="dash-stat-card border-approved">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Total Allocated Budget</span>
              <Building size={20} style={{ color: 'var(--color-approved)' }} />
            </div>
            <strong>₹ {totalAllocated.toLocaleString()}</strong>
            <span className="trend-text" style={{ color: '#6b7280' }}>All Department Caps</span>
          </div>
          <div className="dash-stat-card border-rejected">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Total Spent</span>
              <Wallet size={20} style={{ color: 'var(--color-rejected)' }} />
            </div>
            <strong>₹ {totalSpent.toLocaleString()}</strong>
            <span className="trend-text trend-up"><TrendingUp size={14} /> Active distributions</span>
          </div>
          <div className="dash-stat-card border-draft">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Total Remaining</span>
              <Database size={20} style={{ color: 'var(--color-info)' }} />
            </div>
            <strong>₹ {totalRemaining.toLocaleString()}</strong>
            <span className="trend-text" style={{ color: '#6b7280' }}>Available reserves</span>
          </div>
          <div className="dash-stat-card border-pending">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Awaiting Finance Approval</span>
              <AlertCircle size={20} style={{ color: 'var(--color-pending)' }} />
            </div>
            <strong>{pendingApprovals.length}</strong>
            <span className="trend-text trend-up"><TrendingUp size={14} /> Action pending</span>
          </div>
        </div>

        <div className="dash-table-card">
          <h2>Finance Pending Approvals</h2>
          <table className="dash-table">
            <thead>
              <tr>
                <th>PR Number</th>
                <th>Requester</th>
                <th>Category</th>
                <th>Department</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.map(r => (
                <tr key={r.requisitionId}>
                  <td><strong>{r.requisitionNumber}</strong></td>
                  <td>{r.createdBy?.username}</td>
                  <td>{r.category?.categoryName}</td>
                  <td>{r.department?.departmentName}</td>
                  <td style={{ textAlign: 'right' }}>₹ {(r.totalAmount || 0).toLocaleString()}</td>
                  <td style={{ textAlign: "center" }}>
                    <div className="dash-action-buttons">
                      <button 
                        className="btn-approve" 
                        onClick={() => openActionModal(r.requisitionId, 'APPROVE')}
                        disabled={submittingModal}
                        style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '6px' }}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn-reject" 
                        onClick={() => openActionModal(r.requisitionId, 'REJECT')}
                        disabled={submittingModal}
                        style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendingApprovals.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", color: "#6b7280", padding: "1.5rem" }}>
                    No pending finance approvals.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cost centers summary */}
        <div className="dash-table-card">
          <h2>Cost Center Budget Tracks</h2>
          <div className="cc-progress-list">
            {costCenters.map(cc => {
              const percent = (cc.spent / cc.allocated) * 100;
              return (
                <div key={cc.costCenterId} className="cc-progress-item">
                  <div className="cc-progress-info">
                    <strong>{cc.costCenterName} ({cc.costCenterCode})</strong>
                    <span>₹ {cc.spent.toLocaleString()} Spent / ₹ {cc.allocated.toLocaleString()}</span>
                  </div>
                  <div className="cc-progress-bar-container">
                    <div 
                      className="cc-progress-bar-fill" 
                      style={{ 
                        width: `${Math.min(100, percent)}%`,
                        backgroundColor: percent > 90 ? "var(--color-rejected)" : "var(--color-approved)"
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Confirmation Modal */}
        {actionModal.isOpen && (
          <div className="modal-blur-overlay">
            <div className="zoho-card modal-panel-card" style={{ maxWidth: '420px', border: 'none' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
                Requisition {actionModal.actionType === 'APPROVE' ? 'Approval' : 'Rejection'}
              </h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-black)', marginBottom: '6px' }}>
                  Remarks / Justification {actionModal.actionType === 'REJECT' && <span style={{ color: 'var(--color-rejected)' }}>*</span>}
                </label>
                <textarea
                  rows="3"
                  value={modalRemarks}
                  onChange={(e) => setModalRemarks(e.target.value)}
                  placeholder="Enter remarks..."
                  style={{
                    width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)',
                    fontSize: '13px', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none'
                  }}
                />
              </div>

              {modalError && (
                <p style={{ color: 'var(--color-rejected)', fontSize: '13px', marginBottom: '16px', fontWeight: '500' }}>⚠️ {modalError}</p>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn-enterprise secondary"
                  style={{ flex: 1, height: '40px' }}
                  onClick={() => setActionModal({ isOpen: false, requisitionId: null, actionType: null })}
                >
                  Cancel
                </button>
                <button
                  className="btn-enterprise primary"
                  style={{ flex: 1, height: '40px', backgroundColor: actionModal.actionType === 'APPROVE' ? 'var(--color-approved)' : 'var(--color-rejected)' }}
                  onClick={handleModalConfirm}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (user.role === "Goods Receiver") {
    const awaiting = receiverPOs.filter(p => p.status === "CREATED" || p.status === "PARTIALLY_DELIVERED").length;
    const completed = receiverPOs.filter(p => p.status === "FULLY_DELIVERED").length;

    return (
      <div className="dash-container">
        <div className="dash-header">
          <div>
            <h1>Warehouse Receiving Desk</h1>
            <p>Receiving Workspace · Log physical goods received against active Purchase Orders</p>
          </div>
          <button className="btn-enterprise primary" onClick={() => navigate("/receiving")}>
            <span>Go to Goods Receipt</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="dash-stats-grid" style={{ gridTemplateColumns: '280px 280px 1fr' }}>
          <div className="dash-stat-card border-pending">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Awaiting Receipts</span>
              <Clock size={20} style={{ color: 'var(--color-pending)' }} />
            </div>
            <strong>{awaiting}</strong>
            <span className="trend-text" style={{ color: '#6b7280' }}>Open Purchase Orders</span>
          </div>
          <div className="dash-stat-card border-approved">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Completed Receipts</span>
              <CheckCircle2 size={20} style={{ color: 'var(--color-approved)' }} />
            </div>
            <strong>{completed}</strong>
            <span className="trend-text" style={{ color: '#6b7280' }}>Archived PO distributions</span>
          </div>
        </div>

        <div className="dash-table-card">
          <h2>Active Deliveries</h2>
          <table className="dash-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier</th>
                <th>Order Date</th>
                <th>Delivery Status</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {receiverPOs.slice(0, 5).map(po => (
                <tr key={po.poId}>
                  <td><strong>{po.poNumber}</strong></td>
                  <td>{po.supplier?.supplierName || "Direct Supplier"}</td>
                  <td>{po.createdDate}</td>
                  <td>{po.stage}</td>
                  <td>
                    <span className={`status-pill ${po.status?.toLowerCase() === 'fully_delivered' ? 'approved' : po.status?.toLowerCase() === 'partially_delivered' ? 'pending' : 'po-generated'}`}>
                      {po.status}
                    </span>
                  </td>
                </tr>
              ))}
              {receiverPOs.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", color: "#6b7280", padding: "1.5rem" }}>No active POs in database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (user.role === "Procurement Admin") {
    const pendingReqs = allRequisitions.filter(r => r.status === "PENDING_APPROVAL").length;
    const approvedReqs = allRequisitions.filter(r => r.status === "APPROVED" || r.status === "ORDER_CREATED" || r.status === "RECEIVED").length;
    const rejectedReqs = allRequisitions.filter(r => r.status === "REJECTED").length;
    const totalPOs = allPOs.length;

    return (
      <div className="dash-container">
        <div className="dash-header">
          <div>
            <h1>Procurement Management Control</h1>
            <p>Admin Workspace · System KPIs, approvals overview, and recent activity logs</p>
          </div>
        </div>

        <div className="dash-stats-grid">
          <div className="dash-stat-card border-pending">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Pending Approvals</span>
              <Clock size={20} style={{ color: 'var(--color-pending)' }} />
            </div>
            <strong>{pendingReqs}</strong>
            <span className="trend-text trend-up"><TrendingUp size={14} /> Requires action</span>
          </div>
          <div className="dash-stat-card border-approved">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Approved Requisitions</span>
              <CheckCircle2 size={20} style={{ color: 'var(--color-approved)' }} />
            </div>
            <strong>{approvedReqs}</strong>
            <span className="trend-text trend-up"><TrendingUp size={14} /> +12% this month</span>
          </div>
          <div className="dash-stat-card border-rejected">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Rejected Requisitions</span>
              <XCircle size={20} style={{ color: 'var(--color-rejected)' }} />
            </div>
            <strong>{rejectedReqs}</strong>
            <span className="trend-text trend-down"><TrendingDown size={14} /> -8% vs last month</span>
          </div>
          <div className="dash-stat-card border-draft">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Active Purchase Orders</span>
              <Database size={20} style={{ color: 'var(--color-info)' }} />
            </div>
            <strong>{totalPOs}</strong>
            <span className="trend-text" style={{ color: '#6b7280' }}>Total vendor issues</span>
          </div>
        </div>

        <div className="dash-two-columns">
          {/* Recent activities */}
          <div className="dash-table-card">
            <h2>Recent Audit Activities</h2>
            <div className="audit-list">
              {recentAudits.map(log => (
                <div key={log.auditId} className="audit-item">
                  <div className="audit-meta">
                    <span className="audit-user">👤 {log.user?.username}</span>
                    <span className="audit-time">{log.actionTime ? log.actionTime.replace("T", " ").substring(0, 16) : ""}</span>
                  </div>
                  <p className="audit-desc">
                    <span className="audit-module">[{log.module}]</span> <strong>{log.action}</strong>: {log.remarks}
                  </p>
                </div>
              ))}
              {recentAudits.length === 0 && (
                <p style={{ color: "#6b7280", padding: "1rem 0" }}>No audit log activities recorded.</p>
              )}
            </div>
          </div>

          {/* Latest requests */}
          <div className="dash-table-card">
            <h2>Latest Requisitions</h2>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>PR Number</th>
                  <th>Requester</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ paddingLeft: '16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {allRequisitions.slice(0, 5).map(r => (
                  <tr key={r.requisitionId}>
                    <td><strong>{r.requisitionNumber}</strong></td>
                    <td>{r.createdBy?.username}</td>
                    <td style={{ textAlign: 'right' }}>₹ {(r.totalAmount || 0).toLocaleString()}</td>
                    <td style={{ paddingLeft: '16px' }}>
                      <span className={`status-pill ${r.status?.toLowerCase() === 'draft' ? 'pending' : r.status?.toLowerCase() === 'pending_approval' ? 'pending' : r.status?.toLowerCase() === 'approved' ? 'approved' : r.status?.toLowerCase() === 'rejected' ? 'rejected' : 'po-generated'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return null;
}