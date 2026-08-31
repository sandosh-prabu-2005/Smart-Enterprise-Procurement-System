import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiFetch } from "../../api";
import "./RoleAdmin.css";

export default function RoleAdmin({ user }) {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [usersData, rolesData, userRolesData] = await Promise.all([
          apiFetch("/api/users", {}, user.token),
          apiFetch("/api/roles", {}, user.token),
          apiFetch("/api/user-roles", {}, user.token),
        ]);

        setUsers(usersData);
        setRoles(rolesData);
        setUserRoles(userRolesData);
      } catch {
        setError("Failed to load users and roles data.");
      }
    }
    loadData();
  }, [user.token, location.key]);

  async function toggleRole(userId, roleId) {
    setError("");

    // check if mapping already exists
    const existing = userRoles.find(
      (ur) => ur.user?.userId === userId && ur.role?.roleId === roleId
    );

    if (existing) {
      // delete
      try {
        await apiFetch(
          `/api/user-roles/${existing.userRoleId}`,
          {
            method: "DELETE",
          },
          user.token
        );
        setUserRoles(userRoles.filter((ur) => ur.userRoleId !== existing.userRoleId));
      } catch {
        setError("Failed to revoke role from user.");
      }
    } else {
      // create
      try {
        const payload = {
          user: { userId: userId },
          role: { roleId: roleId },
        };

        const created = await apiFetch(
          "/api/user-roles",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
          user.token
        );

        setUserRoles([...userRoles, created]);
      } catch {
        setError("Failed to assign role to user.");
      }
    }
  }

  function userHasRole(userId, roleId) {
    return userRoles.some(
      (ur) => ur.user?.userId === userId && ur.role?.roleId === roleId
    );
  }

  return (
    <div className="roleadmin-page">
      <h1>Manage Roles</h1>
      <p className="roleadmin-subtext">
        Decide what each user is allowed to do in the system
      </p>
      {error && <p className="roleadmin-error" style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

      <div className="roleadmin-table-card">
        <table className="roleadmin-table">
          <thead>
            <tr>
              <th>User</th>
              {roles.map((role) => (
                <th key={role.roleId}>{role.roleName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.userId}>
                <td>
                  <strong>{u.fullName}</strong>
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>@{u.username}</div>
                </td>
                {roles.map((role) => (
                  <td key={role.roleId} className="roleadmin-checkbox-cell">
                    <input
                      type="checkbox"
                      checked={userHasRole(u.userId, role.roleId)}
                      onChange={() => toggleRole(u.userId, role.roleId)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="roleadmin-note">
        Note: Checks represent active user authorization profiles synchronized in real-time with the database.
      </p>
    </div>
  );
}
