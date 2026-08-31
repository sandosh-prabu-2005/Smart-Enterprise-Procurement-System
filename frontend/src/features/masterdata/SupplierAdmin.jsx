import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiFetch } from "../../api";
import "./SupplierAdmin.css";

export default function SupplierAdmin({ user }) {
  const location = useLocation();
  const [suppliers, setSuppliers] = useState([]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const data = await apiFetch("/api/suppliers", {}, user.token);
        const mapped = data.map((item) => ({
          supplierId: item.supplierId,
          supplierCode: item.supplierCode,
          name: item.supplierName,
          contact: item.contactName,
          email: item.email,
          phone: item.phone,
        }));
        setSuppliers(mapped);
      } catch {
        setError("Failed to load suppliers.");
      }
    }
    loadSuppliers();
  }, [user.token, location.key]);

  async function addSupplier() {
    if (name.trim() === "") {
      return;
    }

    try {
      const code =
        name
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 10) +
        "_" +
        Math.floor(Math.random() * 1000);

      const payload = {
        supplierCode: code,
        supplierName: name,
        contactName: contact,
        email: email,
        phone: phone,
        status: "ACTIVE",
      };

      const created = await apiFetch(
        "/api/suppliers",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        user.token
      );

      const newSupplier = {
        supplierId: created.supplierId,
        supplierCode: created.supplierCode,
        name: created.supplierName,
        contact: created.contactName,
        email: created.email,
        phone: created.phone,
      };

      setSuppliers([...suppliers, newSupplier]);

      setName("");
      setContact("");
      setEmail("");
      setPhone("");
      setError("");
    } catch {
      setError("Failed to add supplier.");
    }
  }

  return (
    <div className="supplier-page">
      <h1>Suppliers</h1>
      <p className="supplier-subtext">Companies you purchase from</p>
      {error && <p className="supplier-error">{error}</p>}

      {/* add supplier form */}
      <div className="supplier-card">
        <h2>Add Supplier</h2>
        <div className="supplier-form-grid">
          <div>
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>Contact name</label>
            <input value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <button className="supplier-add-btn" onClick={addSupplier} disabled={!name}>
          Add supplier
        </button>
      </div>

      {/* supplier list table */}
      <div className="supplier-table-card">
        <table className="supplier-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan="5" className="supplier-empty">No suppliers yet.</td>
              </tr>
            ) : (
              suppliers.map((s, index) => (
                <tr key={s.supplierId || index}>
                  <td>{s.supplierCode || "—"}</td>
                  <td>{s.name}</td>
                  <td>{s.contact || "—"}</td>
                  <td>{s.email || "—"}</td>
                  <td>{s.phone || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
