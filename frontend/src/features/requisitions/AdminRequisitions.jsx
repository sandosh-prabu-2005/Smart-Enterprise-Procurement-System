import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiFetch } from "../../api";
import { useNavigate } from "react-router-dom";
import EnterpriseTable from "../../components/EnterpriseTable";

export default function AdminRequisitions({ user }) {
  const location = useLocation();
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const data = await apiFetch("/api/requisitions", {}, user.token);
        setRequisitions(data);
      } catch (err) {
        console.error("Failed to load requisitions:", err);
        setError("Failed to load requisitions.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user.token, location.key]);

  const headers = [
    { label: "Req No", field: "requisitionNumber" },
    { label: "Date", field: "createdAt", render: (row, val) => new Date(val).toLocaleDateString() },
    { label: "Requester", field: "createdBy.username" },
    { label: "Department", field: "department.departmentName" },
    { label: "Category", field: "category.categoryName" },
    { label: "Total (₹)", field: "totalAmount", align: "right", render: (row, val) => val?.toLocaleString() },
    { 
      label: "Status", 
      field: "status",
      render: (row, val) => {
        let cls = "pending";
        if (val === "APPROVED" || val === "ORDER_CREATED" || val === "COMPLETED") cls = "approved";
        else if (val === "REJECTED") cls = "rejected";
        return <span className={`status-pill ${cls}`}>{val}</span>;
      }
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <h1 className="page-title">Enterprise Requisitions (Admin View)</h1>
      <p className="page-subtext">Complete history and lifecycle tracking of all system requisitions</p>
      
      {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}

      <div className="zoho-card" style={{ padding: '0', border: 'none' }}>
        {loading ? (
          <div style={{ padding: '24px' }}>Loading...</div>
        ) : (
          <EnterpriseTable 
            headers={headers}
            data={requisitions}
            itemsPerPage={15}
            onRowClick={(row) => navigate(`/requisitions/${row.requisitionId}`)}
            emptyMessage="No requisitions found in the system."
            exportFilename="enterprise_requisitions.csv"
          />
        )}
      </div>
    </div>
  );
}