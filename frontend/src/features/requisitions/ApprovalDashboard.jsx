import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { apiFetch } from "../../api";
import { 
  ClipboardList, 
  Building2, 
  Tag, 
  Truck, 
  Calendar, 
  Search
} from "lucide-react";
import "./ApprovalDashboard.css";

function ApprovalDashboard({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'history' ? 'history' : 'pending';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [requests, setRequests] = useState([]);
  const [historyReqs, setHistoryReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [catFilter, setCatFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Dropdown lists
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);

  // Action Modal State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    requisitionId: null,
    requisitionNumber: null,
    actionType: null
  });
  const [modalRemarks, setModalRemarks] = useState('');
  const [modalError, setModalError] = useState('');
  const [submittingModal, setSubmittingModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [reqs, hist, depts, cats] = await Promise.all([
          apiFetch("/api/requisitions/pending", {}, user.token),
          apiFetch("/api/requisitions/approvals/history", {}, user.token),
          apiFetch("/api/departments", {}, user.token),
          apiFetch("/api/categories", {}, user.token),
        ]);
        setRequests(reqs);
        setHistoryReqs(hist);
        setDepartments(depts);
        setCategories(cats);
      } catch {
        setError("Failed to load approvals queue dataset.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user.token, location.key]);

  useEffect(() => {
    const tab = searchParams.get('tab') === 'history' ? 'history' : 'pending';
    setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, deptFilter, catFilter, priorityFilter, activeTab]);

  // Filtering & Sorting
  const currentDataset = activeTab === 'pending' ? requests : historyReqs;
  
  const filteredAndSortedRequests = currentDataset
    .filter((r) => {
      const matchesSearch = 
        (r.requisitionNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.createdBy?.username || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = deptFilter === 'ALL' || String(r.department?.departmentId) === deptFilter;
      const matchesCat = catFilter === 'ALL' || String(r.category?.categoryId) === catFilter;
      const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;

      return matchesSearch && matchesDept && matchesCat && matchesPriority;
    })
    .sort((a, b) => {
      let valA, valB;
      if (sortField === 'totalAmount') {
        valA = a.totalAmount || 0;
        valB = b.totalAmount || 0;
      } else {
        valA = new Date(a.createdAt || 0);
        valB = new Date(b.createdAt || 0);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredAndSortedRequests.length / itemsPerPage);
  const paginatedRequests = filteredAndSortedRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function openActionModal(reqId, reqNum, type) {
    setActionModal({ isOpen: true, requisitionId: reqId, requisitionNumber: reqNum, actionType: type });
    setModalRemarks(type === 'APPROVE' ? 'Approved via sequence queue' : '');
    setModalError('');
  }

  async function handleModalSubmit() {
    if (actionModal.actionType === 'REJECT' && !modalRemarks.trim()) {
      setModalError('Remarks are required for rejection.');
      return;
    }

    setSubmittingModal(true);
    setModalError('');

    try {
      await apiFetch(
        `/api/requisitions/${actionModal.requisitionId}/actions`,
        {
          method: "POST",
          body: JSON.stringify({
            action: actionModal.actionType,
            remarks: modalRemarks,
          }),
        },
        user.token
      );
      setRequests(requests.filter((r) => r.requisitionId !== actionModal.requisitionId));
      setActionModal({ isOpen: false, requisitionId: null, requisitionNumber: null, actionType: null });
    } catch (err) {
      setModalError(err.message || "Failed to process requisition action.");
    } finally {
      setSubmittingModal(false);
    }
  }

  return (
    <div className="approval-page" style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">{activeTab === 'pending' ? "Pending Approvals Queue" : "Approval History"}</h1>
          <p className="page-subtext">{activeTab === 'pending' ? "Review, coordinate, and authorize active purchase requisitions" : "View previously actioned requisitions"}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`btn-${activeTab === 'pending' ? 'primary' : 'secondary'}`} 
            onClick={() => { setActiveTab('pending'); setSearchParams({}); }}
          >
            Pending
          </button>
          <button 
            className={`btn-${activeTab === 'history' ? 'primary' : 'secondary'}`} 
            onClick={() => { setActiveTab('history'); setSearchParams({ tab: 'history' }); }}
          >
            History
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Filters row */}
      <div className="approval-controls-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by Requester, Subject or PR #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-grid">
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.departmentId} value={String(d.departmentId)}>{d.departmentName}</option>
            ))}
          </select>

          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={String(c.categoryId)}>{c.categoryName}</option>
            ))}
          </select>

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <select
            value={`${sortField}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortField(field);
              setSortOrder(order);
            }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="totalAmount-desc">Highest Amount</option>
            <option value="totalAmount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Compiling pending authorizations...</p>
        </div>
      ) : (
        <div className="approval-content-wrapper">
          {paginatedRequests.length === 0 ? (
            <div className="approval-empty-state">
              <ClipboardList size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
              <h3>{activeTab === 'pending' ? "All Caught Up!" : "No History Found"}</h3>
              <p>{activeTab === 'pending' ? "No requisitions are pending your signature review at this time." : "There are no historical records for this view."}</p>
            </div>
          ) : (
            <div className="approval-cards-grid">
              {paginatedRequests.map((r) => {
                let parsedJust = r.justification || '';
                let project = '—';
                let budget = '—';
                try {
                  if (r.justification && r.justification.startsWith('{')) {
                    const parsed = JSON.parse(r.justification);
                    parsedJust = parsed.justification || '';
                    project = parsed.projectCode || '—';
                    budget = parsed.budgetCode || '—';
                  }
                } catch {
                  // Fall back
                }

                return (
                  <div key={r.requisitionId} className="approval-card">
                    {/* Header border matches priority color */}
                    <div className={`card-header-accent priority-${(r.priority || 'MEDIUM').toLowerCase()}`} />
                    
                    <div className="card-top-header">
                      <div className="pr-number-box">
                        <strong onClick={() => navigate(`/requisitions/${r.requisitionId}`)} style={{ cursor: 'pointer', color: 'var(--primary-color)' }}>
                          {r.requisitionNumber}
                        </strong>
                        <span className={`priority-pill priority-${(r.priority || 'MEDIUM').toLowerCase()}`}>
                          {r.priority || 'MEDIUM'}
                        </span>
                      </div>
                      <span className="needed-date-lbl">
                        <Calendar size={12} style={{ marginRight: '4px' }} />
                        Needed: {r.neededBy}
                      </span>
                    </div>

                    <div className="card-main-body">
                      <h3 className="card-subject-title" onClick={() => navigate(`/requisitions/${r.requisitionId}`)}>
                        {r.title}
                      </h3>

                      <div className="card-metadata-grid">
                        <div className="meta-item">
                          <span className="lbl">Requester</span>
                          <span className="val">👤 {r.createdBy?.username}</span>
                        </div>
                        <div className="meta-item">
                          <span className="lbl">Department</span>
                          <span className="val"><Building2 size={13} /> {r.department?.departmentName || '—'}</span>
                        </div>
                        <div className="meta-item">
                          <span className="lbl">Category</span>
                          <span className="val"><Tag size={13} /> {r.category?.categoryName || '—'}</span>
                        </div>
                        <div className="meta-item">
                          <span className="lbl">Supplier</span>
                          <span className="val"><Truck size={13} /> {r.supplier?.supplierName || 'Direct'}</span>
                        </div>
                      </div>

                      {parsedJust && (
                        <div className="card-justification-block">
                          <span className="lbl">Justification</span>
                          <p>{parsedJust}</p>
                        </div>
                      )}

                      <div className="card-codes-row">
                        <span>Project: <strong>{project}</strong></span>
                        <span>GL Code: <strong>{budget}</strong></span>
                      </div>
                    </div>

                    <div className="card-bottom-footer">
                      <div className="card-amount-box">
                        <span className="lbl">Requisition Total</span>
                        <strong className="amount">₹ {(r.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                      </div>
                      
                      <div className="card-actions-row">
                        {activeTab === 'pending' ? (
                        <>
                          <button
                            className="btn-card-action reject"
                            onClick={() => openActionModal(r.requisitionId, r.requisitionNumber, "REJECT")}
                          >
                            Reject
                          </button>
                          <button
                            className="btn-card-action return"
                            onClick={() => openActionModal(r.requisitionId, r.requisitionNumber, "RETURN")}
                          >
                            Return
                          </button>
                          <button
                            className="btn-card-action approve"
                            onClick={() => openActionModal(r.requisitionId, r.requisitionNumber, "APPROVE")}
                          >
                            Approve
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn-card-action secondary"
                          style={{ width: '100%' }}
                          onClick={() => navigate(`/requisitions/${r.requisitionId}`)}
                        >
                          View Details
                        </button>
                      )}
                    </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0', borderTop: '1px solid var(--border-color)', marginTop: '24px' }}>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedRequests.length)} of {filteredAndSortedRequests.length} requisitions
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px' }}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: currentPage === i + 1 ? 'var(--primary-color)' : '#d1d5db',
                      backgroundColor: currentPage === i + 1 ? 'var(--primary-color)' : 'white',
                      color: currentPage === i + 1 ? 'white' : '#374151',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action modal Confirmation overlay */}
      {actionModal.isOpen && (
        <div className="modal-blur-overlay">
          <div className="zoho-card modal-panel-card" style={{ maxWidth: '420px', border: 'none' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>
              Confirm Requisition {actionModal.actionType === 'APPROVE' ? 'Approval' : 'Rejection'}
            </h3>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
              PR Number: <strong>{actionModal.requisitionNumber}</strong>
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-black)', marginBottom: '6px' }}>
                Remarks / Comments {actionModal.actionType === 'REJECT' && <span style={{ color: 'var(--color-rejected)' }}>*</span>}
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
                onClick={() => setActionModal({ isOpen: false, requisitionId: null, requisitionNumber: null, actionType: null })}
              >
                Cancel
              </button>
              <button
                className="btn-enterprise primary"
                style={{ flex: 1, height: '40px', backgroundColor: actionModal.actionType === 'APPROVE' ? 'var(--color-approved)' : 'var(--color-rejected)' }}
                onClick={handleModalSubmit}
                disabled={submittingModal}
              >
                {submittingModal ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApprovalDashboard;