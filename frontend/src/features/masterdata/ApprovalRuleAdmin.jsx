import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiFetch } from "../../api";
import "./ApprovalRuleAdmin.css";

export default function ApprovalRuleAdmin({ user }) {
  const location = useLocation();
  const [rules, setRules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [roles, setRoles] = useState([]);

  // form fields
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedCatId, setSelectedCatId] = useState("");
  const [step1RoleId, setStep1RoleId] = useState("");
  const [step2RoleId, setStep2RoleId] = useState("");
  const [step3RoleId, setStep3RoleId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [rulesData, approversData, deptData, catData, rolesData] = await Promise.all([
          apiFetch("/api/approval-rules", {}, user.token),
          apiFetch("/api/approval-rule-approvers", {}, user.token),
          apiFetch("/api/departments", {}, user.token),
          apiFetch("/api/categories", {}, user.token),
          apiFetch("/api/roles", {}, user.token),
        ]);

        setDepartments(deptData);
        setCategories(catData);
        setRoles(rolesData);

        // link approvers to rules
        const rulesWithApprovers = rulesData.map((rule) => {
          const chain = approversData
            .filter((app) => app.rule?.ruleId === rule.ruleId)
            .sort((a, b) => a.sequenceNo - b.sequenceNo)
            .map((app) => app.role?.roleName || "Unknown")
            .join(" ➔ ");

          return {
            ...rule,
            approverChain: chain || "No approvers configured",
          };
        });

        setRules(rulesWithApprovers);
      } catch {
        setError("Failed to load approval rules configuration.");
      }
    }
    loadData();
  }, [user.token, location.key]);

  async function addRule() {
    if (minAmount === "" || maxAmount === "" || !selectedDeptId || !selectedCatId || !step1RoleId) {
      setError("Please fill out all required fields, including at least Step 1 Approver.");
      return;
    }

    try {
      const rulePayload = {
        department: { departmentId: parseInt(selectedDeptId) },
        category: { categoryId: parseInt(selectedCatId) },
        minAmount: parseFloat(minAmount),
        maxAmount: parseFloat(maxAmount),
        isActive: true,
      };

      const newRule = await apiFetch(
        "/api/approval-rules",
        {
          method: "POST",
          body: JSON.stringify(rulePayload),
        },
        user.token
      );

      // Now create sequential approvers
      const selectedSteps = [step1RoleId, step2RoleId, step3RoleId].filter(Boolean);
      const approverPromises = selectedSteps.map((roleId, index) => {
        const approverPayload = {
          rule: { ruleId: newRule.ruleId },
          sequenceNo: index + 1,
          role: { roleId: parseInt(roleId) },
        };
        return apiFetch(
          "/api/approval-rule-approvers",
          {
            method: "POST",
            body: JSON.stringify(approverPayload),
          },
          user.token
        );
      });

      const savedApprovers = await Promise.all(approverPromises);

      // construct chain string
      const chainStr = savedApprovers
        .sort((a, b) => a.sequenceNo - b.sequenceNo)
        .map((app) => app.role?.roleName || "Unknown")
        .join(" ➔ ");

      setRules([
        ...rules,
        {
          ...newRule,
          approverChain: chainStr,
        },
      ]);

      setMinAmount("");
      setMaxAmount("");
      setSelectedDeptId("");
      setSelectedCatId("");
      setStep1RoleId("");
      setStep2RoleId("");
      setStep3RoleId("");
      setError("");
    } catch {
      setError("Failed to add approval rule.");
    }
  }

  async function removeRule(ruleId) {
    try {
      await apiFetch(
        `/api/approval-rules/${ruleId}`,
        {
          method: "DELETE",
        },
        user.token
      );
      setRules(rules.filter((r) => r.ruleId !== ruleId));
    } catch {
      setError("Failed to delete approval rule.");
    }
  }

  return (
    <div className="rule-page">
      <h1>Approval Rules</h1>
      <p className="rule-subtext">Decide who approves a request, based on amount and category</p>
      {error && <p className="rule-error" style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

      {/* add rule form */}
      <div className="rule-card">
        <h2>Add Rule</h2>
        <div className="rule-form-grid">
          <div>
            <label>Department</label>
            <select value={selectedDeptId} onChange={(e) => setSelectedDeptId(e.target.value)}>
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>
                  {d.departmentName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Category</label>
            <select value={selectedCatId} onChange={(e) => setSelectedCatId(e.target.value)}>
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Min amount (₹)</label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
          </div>
          <div>
            <label>Max amount (₹)</label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>
        </div>

        <h3 style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>Sequential Approvers</h3>
        <div className="rule-form-grid">
          <div>
            <label>Step 1 Approver Role</label>
            <select value={step1RoleId} onChange={(e) => setStep1RoleId(e.target.value)}>
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r.roleId} value={r.roleId}>
                  {r.roleName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Step 2 Approver Role (Optional)</label>
            <select value={step2RoleId} onChange={(e) => setStep2RoleId(e.target.value)}>
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r.roleId} value={r.roleId}>
                  {r.roleName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Step 3 Approver Role (Optional)</label>
            <select value={step3RoleId} onChange={(e) => setStep3RoleId(e.target.value)}>
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r.roleId} value={r.roleId}>
                  {r.roleName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="rule-add-btn" onClick={addRule} style={{ marginTop: "1.5rem" }}>
          Add rule
        </button>
      </div>

      {/* rules list table */}
      <div className="rule-table-card">
        <table className="rule-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Department</th>
              <th>Category</th>
              <th>Amount Range</th>
              <th>Approver Chain</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 ? (
              <tr>
                <td colSpan="6" className="rule-empty">No rules set yet.</td>
              </tr>
            ) : (
              rules.map((r) => (
                <tr key={r.ruleId}>
                  <td>{r.ruleId}</td>
                  <td>{r.department?.departmentName || "Any"}</td>
                  <td>{r.category?.categoryName || "Any"}</td>
                  <td>₹ {r.minAmount.toLocaleString()} – ₹ {r.maxAmount.toLocaleString()}</td>
                  <td>{r.approverChain}</td>
                  <td>
                    <button className="rule-remove-btn" onClick={() => removeRule(r.ruleId)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
