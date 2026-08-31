import { useState, useEffect } from "react";
import { apiFetch } from "../../api";
import { 
  BarChart3, 
  Database, 
  Download, 
  FileSpreadsheet
} from "lucide-react";
import "./ReportsDashboard.css";

export default function ReportsDashboard({ user }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [totalSpend, setTotalSpend] = useState(0);
  const [byDepartment, setByDepartment] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    async function loadReportData() {
      try {
        const [requisitions, logs] = await Promise.all([
          apiFetch("/api/requisitions", {}, user.token),
          apiFetch("/api/audit-logs", {}, user.token),
        ]);

        const approved = requisitions.filter(
          (r) => r.status === "APPROVED" || r.status === "ORDER_CREATED" || r.status === "RECEIVED"
        );

        // 1. Total Spend
        const total = approved.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
        setTotalSpend(total);

        // 2. Spend by Department
        const deptMap = {};
        approved.forEach((r) => {
          const deptName = r.department?.departmentName || "General Admin";
          deptMap[deptName] = (deptMap[deptName] || 0) + (r.totalAmount || 0);
        });
        const deptList = Object.keys(deptMap).map((name) => ({
          name,
          amount: deptMap[name],
        }));
        setByDepartment(deptList);

        // 3. Spend by Category
        const catMap = {};
        approved.forEach((r) => {
          const catName = r.category?.categoryName || "Operational Support";
          catMap[catName] = (catMap[catName] || 0) + (r.totalAmount || 0);
        });
        const catList = Object.keys(catMap).map((name) => ({
          name,
          amount: catMap[name],
        }));
        setByCategory(catList);

        // 4. Spend by Vendor
        const vendorMap = {};
        approved.forEach((r) => {
          if (!r.supplier) return;
          const vendorName = r.supplier.supplierName;
          if (!vendorMap[vendorName]) {
            vendorMap[vendorName] = { amount: 0, count: 0 };
          }
          vendorMap[vendorName].amount += r.totalAmount || 0;
          vendorMap[vendorName].count += 1;
        });
        const vendorList = Object.keys(vendorMap).map((name) => ({
          name,
          amount: vendorMap[name].amount,
          orders: vendorMap[name].count,
        }));
        setTopVendors(vendorList.sort((a, b) => b.amount - a.amount));

        // 5. Audit Logs
        const sortedLogs = logs.sort(
          (a, b) => new Date(b.actionTime) - new Date(a.actionTime)
        );
        setAuditLogs(sortedLogs);
      } catch {
        setError("Failed to compile spend reports and system audit trails.");
      } finally {
        setLoading(false);
      }
    }
    loadReportData();
  }, [user.token]);

  const exportData = (type) => {
    let headers = [];
    let rows = [];
    let filename = "";

    if (type === "spend_department") {
      headers = ["Department Name", "Total Spend (₹)"];
      rows = byDepartment.map(d => [d.name, d.amount]);
      filename = "spend_by_department.csv";
    } else if (type === "spend_category") {
      headers = ["Category Name", "Total Spend (₹)"];
      rows = byCategory.map(c => [c.name, c.amount]);
      filename = "spend_by_category.csv";
    } else if (type === "vendors") {
      headers = ["Vendor Name", "Purchase Orders Count", "Total Amount (₹)"];
      rows = topVendors.map(v => [v.name, v.orders, v.amount]);
      filename = "vendor_allocations.csv";
    } else if (type === "audit_logs") {
      headers = ["Action Date/Time", "User Initiated", "Security Module", "Action", "Context Details"];
      rows = auditLogs.map(l => [
        new Date(l.actionTime).toLocaleString(),
        l.user?.fullName || l.user?.username || "System",
        l.module,
        l.action,
        l.remarks
      ]);
      filename = "security_audit_logs.csv";
    }

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxDept = byDepartment.length ? Math.max(...byDepartment.map(d => d.amount)) : 1;
  const maxCategory = byCategory.length ? Math.max(...byCategory.map(c => c.amount)) : 1;

  return (
    <div className="reports-page-wrapper" style={{ fontFamily: 'var(--font-body)' }}>
      <div className="reports-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Procurement Analytics & Audit Logs</h1>
          <p className="page-subtext">Consolidated financial spend metrics, vendor rankings, and system security logs</p>
        </div>
      </div>

      {error && (
        <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#fee2e2", color: "#b91c1c", fontSize: "14px", marginBottom: "20px", fontWeight: "600" }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Compiling database report matrices...</p>
        </div>
      ) : (
        <div className="reports-grid-layout" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Spend Summary KPI card */}
          <div className="reports-kpi-card zoho-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '5px solid var(--primary-color)' }}>
            <div className="kpi-icon-box" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyCentent: 'center', justifyContent: 'center' }}>
              <BarChart3 size={24} />
            </div>
            <div className="kpi-values" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                Consolidated Approved Spend
              </span>
              <strong style={{ fontSize: '28px', color: 'var(--color-black)', fontWeight: 700 }}>
                ₹ {totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          {/* Spend department / category charts */}
          <div className="reports-charts-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px' }}>
            
            {/* Chart 1: Department Spend */}
            <div className="reports-chart-card zoho-card">
              <div className="chart-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-black)' }}>Spend by Department</h3>
                <button className="btn-enterprise secondary" style={{ height: '32px', padding: '0 10px', fontSize: '12px' }} onClick={() => exportData("spend_department")}>
                  <Download size={12} />
                  <span>CSV Export</span>
                </button>
              </div>
              
              <div className="chart-container">
                {byDepartment.length === 0 ? (
                  <p className="empty-chart-msg" style={{ fontStyle: 'italic', color: '#6b7280', textAlign: 'center', padding: '24px' }}>No department spend available.</p>
                ) : (
                  <div className="svg-chart-wrapper">
                    <svg viewBox="0 0 500 160" width="100%" height="100%">
                      {byDepartment.map((d, idx) => {
                        const barWidth = (d.amount / maxDept) * 300;
                        const yPos = idx * 30 + 10;
                        return (
                          <g key={idx}>
                            <text x="10" y={yPos + 15} fill="#4b5563" fontSize="11" fontWeight="600">
                              {d.name.length > 15 ? d.name.substring(0, 15) + "..." : d.name}
                            </text>
                            <rect x="140" y={yPos + 4} width="300" height="14" fill="var(--bg-color)" rx="3" />
                            {/* Crimson red bar graph indicator */}
                            <rect x="140" y={yPos + 4} width={Math.max(barWidth, 8)} height="14" fill="var(--primary-color)" rx="3" />
                            <text x="490" y={yPos + 15} fill="#111" fontSize="11" fontWeight="700" textAnchor="end">
                              ₹{Math.round(d.amount / 1000)}k
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Category Spend */}
            <div className="reports-chart-card zoho-card">
              <div className="chart-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-black)' }}>Spend by Category</h3>
                <button className="btn-enterprise secondary" style={{ height: '32px', padding: '0 10px', fontSize: '12px' }} onClick={() => exportData("spend_category")}>
                  <Download size={12} />
                  <span>CSV Export</span>
                </button>
              </div>
              
              <div className="chart-container">
                {byCategory.length === 0 ? (
                  <p className="empty-chart-msg" style={{ fontStyle: 'italic', color: '#6b7280', textAlign: 'center', padding: '24px' }}>No category spend available.</p>
                ) : (
                  <div className="svg-chart-wrapper">
                    <svg viewBox="0 0 500 160" width="100%" height="100%">
                      {byCategory.map((c, idx) => {
                        const barWidth = (c.amount / maxCategory) * 300;
                        const yPos = idx * 30 + 10;
                        return (
                          <g key={idx}>
                            <text x="10" y={yPos + 15} fill="#4b5563" fontSize="11" fontWeight="600">
                              {c.name.length > 15 ? c.name.substring(0, 15) + "..." : c.name}
                            </text>
                            <rect x="140" y={yPos + 4} width="300" height="14" fill="var(--bg-color)" rx="3" />
                            {/* Approved green category chart indicator */}
                            <rect x="140" y={yPos + 4} width={Math.max(barWidth, 8)} height="14" fill="var(--color-approved)" rx="3" />
                            <text x="490" y={yPos + 15} fill="#111" fontSize="11" fontWeight="700" textAnchor="end">
                              ₹{Math.round(c.amount / 1000)}k
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vendors ranking */}
          <div className="reports-table-card zoho-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="table-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px 16px 32px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-black)', margin: 0 }}>Vendor Spending Allocations</h3>
              <button className="btn-enterprise secondary" style={{ height: '36px', padding: '0 12px', fontSize: '13px' }} onClick={() => exportData("vendors")}>
                <FileSpreadsheet size={14} />
                <span>Export Vendor Allocations</span>
              </button>
            </div>
            
            <table className="dash-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: 'var(--bg-color)' }}>
                <tr>
                  <th style={{ padding: '12px 32px', textAlign: 'left' }}>Preferred Vendor Partner</th>
                  <th style={{ padding: '12px 32px', textAlign: 'center' }}>Requisitions Handled</th>
                  <th style={{ padding: '12px 32px', textAlign: 'right' }}>Total Allocated Amount</th>
                </tr>
              </thead>
              <tbody>
                {topVendors.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
                      No supplier spend recorded in this database range.
                    </td>
                  </tr>
                ) : (
                  topVendors.map((v, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '14px 32px' }}><strong>{v.name}</strong></td>
                      <td style={{ padding: '14px 32px', textAlign: 'center' }}>{v.orders}</td>
                      <td style={{ padding: '14px 32px', textAlign: 'right', fontWeight: '700' }}>
                        ₹ {v.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Security audit logs */}
          <div className="reports-table-card zoho-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="table-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px 16px 32px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Database size={18} style={{ color: 'var(--primary-color)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-black)', margin: 0 }}>Internal Security Audit Trails</h3>
              </div>
              
              <button className="btn-enterprise secondary" style={{ height: '36px', padding: '0 12px', fontSize: '13px' }} onClick={() => exportData("audit_logs")}>
                <FileSpreadsheet size={14} />
                <span>Export Security Logs</span>
              </button>
            </div>
            
            <div style={{ maxHeight: "360px", overflowY: "auto" }}>
              <table className="dash-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '12px 32px', textAlign: 'left' }}>Time Stamp</th>
                    <th style={{ padding: '12px 32px', textAlign: 'left' }}>User Session</th>
                    <th style={{ padding: '12px 32px', textAlign: 'left' }}>Sub-system Module</th>
                    <th style={{ padding: '12px 32px', textAlign: 'left' }}>Operation</th>
                    <th style={{ padding: '12px 32px', textAlign: 'left' }}>Context Audit Logs</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
                        No security logs compiled.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.auditId}>
                        <td style={{ padding: '12px 32px', whiteSpace: "nowrap", fontSize: "12px", color: "#6b7280" }}>
                          {new Date(log.actionTime).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 32px' }}><strong>{log.user?.fullName || log.user?.username || "SYSTEM"}</strong></td>
                        <td style={{ padding: '12px 32px' }}><span className="status-pill po-generated" style={{ fontSize: '11px', padding: '2px 8px' }}>{log.module}</span></td>
                        <td style={{ padding: '12px 32px' }}>
                          <span className={`status-pill ${log.action?.toLowerCase().includes('reject') ? 'rejected' : log.action?.toLowerCase().includes('approve') ? 'approved' : 'po-generated'}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '12px 32px', fontSize: "12.5px", color: "#4b5563" }}>{log.remarks}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}