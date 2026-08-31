import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiFetch } from "../../api";
import "./Catalog.css";

export default function Catalog({ user }) {
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await apiFetch("/api/categories", {}, user.token);
        setCategories(data);
      } catch {
        setError("Failed to load categories.");
      }
    }
    loadCategories();
  }, [user.token, location.key]);

  async function addCategory() {
    if (name.trim() === "" || code.trim() === "") {
      return;
    }

    try {
      const payload = {
        categoryCode: code.trim().toUpperCase(),
        categoryName: name.trim(),
        description: description.trim(),
        status: status,
      };

      const created = await apiFetch(
        "/api/categories",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        user.token
      );

      setCategories([...categories, created]);

      setCode("");
      setName("");
      setDescription("");
      setStatus("ACTIVE");
      setError("");
    } catch {
      setError("Failed to add category. Code might already exist.");
    }
  }

  return (
    <div className="cat-page">
      <h1>Category Catalog</h1>
      <p className="cat-subtext">Product categories with approval configurations</p>
      {error && <p className="cat-error" style={{ color: "var(--danger-color, red)", marginBottom: "1rem" }}>{error}</p>}

      <div className="cat-card">
        <h2>Add Category</h2>
        <div className="cat-form-grid">
          <div>
            <label>Category Code</label>
            <input
              placeholder="e.g. CAT006"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div>
            <label>Name</label>
            <input
              placeholder="e.g. IT Hardware"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label>Description</label>
            <input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                backgroundColor: "white",
              }}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>
        <button className="cat-add-btn" onClick={addCategory} disabled={!name || !code}>
          Add Category
        </button>
      </div>

      <div className="cat-table-card">
        <table className="cat-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="cat-empty">No categories yet.</td>
              </tr>
            ) : (
              categories.map((cat, index) => (
                <tr key={cat.categoryId || index}>
                  <td>{cat.categoryId}</td>
                  <td>{cat.categoryCode}</td>
                  <td>{cat.categoryName}</td>
                  <td>{cat.description || "—"}</td>
                  <td>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        backgroundColor: cat.status === "ACTIVE" ? "#e6f4ea" : "#fce8e6",
                        color: cat.status === "ACTIVE" ? "#137333" : "#c5221f",
                      }}
                    >
                      {cat.status}
                    </span>
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
