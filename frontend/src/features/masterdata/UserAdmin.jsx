import { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import { apiFetch } from '../../api';

export default function UserAdmin({ user }) {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);

  const [newUser, setNewUser] = useState({
    employeeId: '',
    fullName: '',
    username: '',
    email: '',
    designation: '',
    passwordHash: '',
    confirmPassword: '',
    departmentId: '',
    roleId: '',
    status: 'ACTIVE'
  });

  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, rRes, dRes] = await Promise.all([
        apiFetch('/api/users', {}, user.token),
        apiFetch('/api/roles', {}, user.token),
        apiFetch('/api/departments', {}, user.token)
      ]);
      setUsers(uRes);
      setRoles(rRes);
      setDepartments(dRes);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch-on-mount: loadData is redefined every render, so including it in
  // the deps array below would cause this to refetch on every render.
  useEffect(() => {
    loadData();
  }, [user.token, location.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleActivate = async (userId, roleId) => {
    if (!roleId) {
      alert('Please select a role before activating.');
      return;
    }
    try {
      await apiFetch(`/api/users/${userId}/activate?roleId=${roleId}`, { method: 'PUT' }, user.token);
      loadData();
    } catch (err) {
      console.error('Failed to activate user:', err);
      alert('Failed to activate user.');
    }
  };

  const pendingUsers = users.filter(u => u.status === 'PENDING');
  const activeUsers = users.filter(u => u.status !== 'PENDING');

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (newUser.passwordHash !== newUser.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const payload = {
        employeeId: newUser.employeeId,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        designation: newUser.designation,
        passwordHash: newUser.passwordHash,
        status: newUser.status,
        department: newUser.departmentId ? { departmentId: parseInt(newUser.departmentId) } : null
      };

      await apiFetch(`/api/users?roleId=${newUser.roleId}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }, user.token);
      
      alert("User created successfully!");
      setShowForm(false);
      setNewUser({
        employeeId: '', fullName: '', username: '', email: '', designation: '', 
        passwordHash: '', confirmPassword: '', departmentId: '', roleId: '', status: 'ACTIVE'
      });
      loadData();
    } catch (err) {
      console.error('Failed to create user:', err);
      alert("Failed to create user");
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '8px', color: 'var(--color-black)', fontSize: '24px' }}>User Administration</h1>
      <p style={{ color: 'var(--color-gray-dark)', marginBottom: '24px' }}>Approve pending sign-ups and manage roles.</p>
      
      {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}
      {loading && <div style={{ color: 'var(--color-gray-dark)', marginBottom: '16px' }}>Loading users...</div>}

      <div style={{ marginBottom: '24px' }}>
        <button className="btn-enterprise primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create New User'}
        </button>
      </div>

      {showForm && (
        <div className="zoho-card" style={{ padding: '24px', marginBottom: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px' }}>Create User</h3>
          <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="zoho-label">Employee ID</label>
              <input required type="text" className="zoho-input" value={newUser.employeeId} onChange={e => setNewUser({...newUser, employeeId: e.target.value})} />
            </div>
            <div>
              <label className="zoho-label">Full Name</label>
              <input required type="text" className="zoho-input" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} />
            </div>
            <div>
              <label className="zoho-label">Username</label>
              <input required type="text" className="zoho-input" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
            </div>
            <div>
              <label className="zoho-label">Email</label>
              <input required type="email" className="zoho-input" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
            </div>
            <div>
              <label className="zoho-label">Password</label>
              <input required type="password" className="zoho-input" value={newUser.passwordHash} onChange={e => setNewUser({...newUser, passwordHash: e.target.value})} />
            </div>
            <div>
              <label className="zoho-label">Confirm Password</label>
              <input required type="password" className="zoho-input" value={newUser.confirmPassword} onChange={e => setNewUser({...newUser, confirmPassword: e.target.value})} />
            </div>
            <div>
              <label className="zoho-label">Designation</label>
              <input required type="text" className="zoho-input" value={newUser.designation} onChange={e => setNewUser({...newUser, designation: e.target.value})} />
            </div>
            <div>
              <label className="zoho-label">Department</label>
              <select required className="zoho-input" value={newUser.departmentId} onChange={e => setNewUser({...newUser, departmentId: e.target.value})}>
                <option value="">-- Select Department --</option>
                {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
              </select>
            </div>
            <div>
              <label className="zoho-label">Role</label>
              <select required className="zoho-input" value={newUser.roleId} onChange={e => setNewUser({...newUser, roleId: e.target.value})}>
                <option value="">-- Select Role --</option>
                {roles.map(r => <option key={r.roleId} value={r.roleId}>{r.roleName}</option>)}
              </select>
            </div>
            <div>
              <label className="zoho-label">Status</label>
              <select className="zoho-input" value={newUser.status} onChange={e => setNewUser({...newUser, status: e.target.value})}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
              <button type="submit" className="btn-enterprise primary">Save User</button>
            </div>
          </form>
        </div>
      )}

      <div className="zoho-card" style={{ padding: '24px', marginBottom: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px' }}>Pending Approvals</h3>
        {pendingUsers.length === 0 ? (
          <p style={{ color: 'var(--color-gray)' }}>No pending user registrations.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px' }}>Employee</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Designation</th>
                <th style={{ padding: '12px' }}>Assign Role</th>
                <th style={{ padding: '12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map(u => (
                <UserActivationRow key={u.userId} u={u} roles={roles} onActivate={handleActivate} />
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="zoho-card" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '16px' }}>Active Users</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px' }}>Employee</th>
              <th style={{ padding: '12px' }}>Email</th>
              <th style={{ padding: '12px' }}>Username</th>
              <th style={{ padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {activeUsers.map(u => (
              <tr key={u.userId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px' }}>{u.fullName} ({u.employeeId})</td>
                <td style={{ padding: '12px' }}>{u.email}</td>
                <td style={{ padding: '12px' }}>{u.username}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserActivationRow({ u, roles, onActivate }) {
  const [selectedRole, setSelectedRole] = useState('');

  return (
    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
      <td style={{ padding: '12px' }}>
        <strong>{u.fullName}</strong><br />
        <span style={{ fontSize: '12px', color: '#6b7280' }}>{u.employeeId}</span>
      </td>
      <td style={{ padding: '12px' }}>{u.email}</td>
      <td style={{ padding: '12px' }}>{u.designation}</td>
      <td style={{ padding: '12px' }}>
        <select 
          className="zoho-input"
          value={selectedRole} 
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{ width: '150px' }}
        >
          <option value="">-- Select Role --</option>
          {roles.map(r => (
            <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
          ))}
        </select>
      </td>
      <td style={{ padding: '12px' }}>
        <button 
          onClick={() => onActivate(u.userId, selectedRole)}
          style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
        >
          Activate
        </button>
      </td>
    </tr>
  );
}