import { useState, useEffect } from "react";
import { apiFetch } from "../../api";
import "./FinanceDashboard.css";

function FinanceDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [costCenters, setCostCenters] = useState([]);
  const [stats, setStats] = useState({
    totalAllocated: 0,
    totalSpent: 0,
    totalRemaining: 0,
    pendingCount: 0,
  });

  useEffect(() => {
    async function loadFinanceData() {
      try {
        const [ccData, reqData] = await Promise.all([
          apiFetch("/api/cost-centers", {}, user.token),
          apiFetch("/api/requisitions", {}, user.token),
        ]);

        const approved = reqData.filter(
          (r) => r.status === "APPROVED" || r.status === "ORDER_CREATED"
        );

        // Compute spend per cost center (simulated allocation of 500,000 INR per cost center)
        const ALLOCATION_PER_CC = 500000;
        
        const mappedCCs = ccData.map((cc) => {
          // Find all approved requisitions belonging to departments in this cost center
          const spent = approved
            .filter((r) => r.department?.costCenter?.costCenterId === cc.costCenterId)
            .reduce((sum, r) => sum + (r.totalAmount || 0), 0);

          return {
            ...cc,
            allocated: ALLOCATION_PER_CC,
            spent: spent,
            remaining: Math.max(0, ALLOCATION_PER_CC - spent),
          };
        });

        setCostCenters(mappedCCs);

        const totalAllocated = mappedCCs.reduce((sum, cc) => sum + cc.allocated, 0);
        const totalSpent = mappedCCs.reduce((sum, cc) => sum + cc.spent, 0);
        const totalRemaining = totalAllocated - totalSpent;
        const pendingCount = reqData.filter((r) => r.status === "PENDING_APPROVAL").length;

        setStats({
          totalAllocated,
          totalSpent,
          totalRemaining,
          pendingCount,
        });

      } catch (err) {
        console.error("Finance dashboard load failed:", err);
        setError("Failed to compile financial metrics. Please confirm backend status.");
      } finally {
        setLoading(false);
      }
    }
    loadFinanceData();
  }, [user.token]);

  return (
    <div className="fin-page">
      <h1>Finance Dashboard</h1>
      <p className="fin-subtext">Budget management, spend trackers, and department allocations</p>
      {error && <p className="fin-error" style={{ color: "red" }}>{error}</p>}

      {loading ? (
        <p style={{ padding: "1.5rem" }}>Loading financial dashboard...</p>
      ) : (
        <>
          {/* stats grid */}
          <div className="fin-stats-grid">
            <div className="fin-stat-card">
              <span>Total Allocated Budget</span>
              <strong>₹ {stats.totalAllocated.toLocaleString()}</strong>
            </div>
            <div className="fin-stat-card spent">
              <span>Total Budget Spent</span>
              <strong>₹ {stats.totalSpent.toLocaleString()}</strong>
            </div>
            <div className="fin-stat-card remaining">
              <span>Total Remaining Budget</span>
              <strong>₹ {stats.totalRemaining.toLocaleString()}</strong>
            </div>
            <div className="fin-stat-card pending">
              <span>Pending Approvals</span>
              <strong>{stats.pendingCount}</strong>
            </div>
          </div>

          {/* cost center budgets */}
          <div className="fin-card">
            <h2>Cost Center Allocations & Spend</h2>
            <div className="fin-cc-list">
              {costCenters.map((cc) => {
                const percent = (cc.spent / cc.allocated) * 100;
                return (
                  <div key={cc.costCenterId} className="fin-cc-row">
                    <div className="fin-cc-info">
                      <strong>{cc.costCenterName}</strong>
                      <span className="fin-cc-code">{cc.costCenterCode} · {cc.description}</span>
                    </div>
                    <div className="fin-cc-progress-container">
                      <div className="fin-cc-progress-bar">
                        <div
                          className="fin-cc-progress-fill"
                          style={{ width: `${Math.min(100, percent)}%`, backgroundColor: percent > 90 ? "#ea4335" : "#34a853" }}
                        ></div>
                      </div>
                      <div className="fin-cc-metrics">
                        <span>Spent: ₹ {cc.spent.toLocaleString()}</span>
                        <span>Remaining: ₹ {cc.remaining.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FinanceDashboard;
