import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/Login';
import SignUp from './features/auth/SignUp';
import POTracker from './features/purchase-orders/POTracker';
import Receiving from './features/purchase-orders/Receiving';
import FinancePayments from './features/purchase-orders/FinancePayments';
import GoodsVerification from './features/purchase-orders/GoodsVerification';
import RequestDetail from './features/requisitions/RequestDetail';
import MyRequests from './features/requisitions/MyRequests';
import RequisitionForm from './features/requisitions/RequisitionForm';
import ApprovalDashboard from './features/requisitions/ApprovalDashboard';
import Dashboard from './features/dashboard/Dashboard';
import Catalog from './features/masterdata/Catalog';
import SupplierAdmin from './features/masterdata/SupplierAdmin';
import RoleAdmin from './features/masterdata/RoleAdmin';
import UserAdmin from './features/masterdata/UserAdmin';
import AdminRequisitions from './features/requisitions/AdminRequisitions';
import ApprovalRuleAdmin from './features/masterdata/ApprovalRuleAdmin';
import ReportsDashboard from './features/analytics/ReportsDashboard';
import DashboardLayout from './components/DashboardLayout';
import SessionTimeout from './components/SessionTimeout';
import ProfileSettings from './features/auth/ProfileSettings';
import { CANONICAL_ROLES } from './utils/roles';
import './App.css';

// Restore the logged-in user (token + normalized roles) from localStorage
// on page refresh, instead of losing the session every time.
function getStoredUser() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Wraps a route so it actually checks the logged-in user's roles, not just
// "are they logged in at all". Without this, any authenticated account
// could reach any URL directly (e.g. a Requester typing /roles into the
// address bar), regardless of what the sidebar shows them.
function ProtectedRoute({ user, allowedRoles, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !user.roles.some((r) => allowedRoles.includes(r))) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

const { ADMIN, APPROVER, FINANCE, RECEIVER, REQUESTER } = CANONICAL_ROLES;

function App() {
  const [user, setUser] = useState(getStoredUser());
  const isAuthenticated = !!user;

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  return (
    <>
      {isAuthenticated ? (
        <DashboardLayout user={user} onLogout={setUser}>
          <Routes>
            {/* Every authenticated user, regardless of role */}
            <Route path="/dashboard" element={<ProtectedRoute user={user}><Dashboard user={user} /></ProtectedRoute>} />
            <Route path="/requisitions" element={<ProtectedRoute user={user}><MyRequests user={user} /></ProtectedRoute>} />
            <Route path="/purchase-orders" element={<ProtectedRoute user={user} allowedRoles={[ADMIN, RECEIVER, REQUESTER, FINANCE, APPROVER]}><POTracker user={user} /></ProtectedRoute>} />
            <Route path="/receiving" element={<ProtectedRoute user={user} allowedRoles={[ADMIN, RECEIVER]}><Receiving user={user} /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute user={user} allowedRoles={[ADMIN, FINANCE]}><FinancePayments user={user} /></ProtectedRoute>} />
            <Route path="/requisitions/new" element={<ProtectedRoute user={user}><RequisitionForm user={user} /></ProtectedRoute>} />
            <Route path="/requisitions/:id" element={<ProtectedRoute user={user}><RequestDetail user={user} /></ProtectedRoute>} />
            <Route path="/catalog" element={<ProtectedRoute user={user}><Catalog user={user} /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute user={user}><ProfileSettings user={user} onLogout={setUser} /></ProtectedRoute>} />

            {/* Approver, Finance, Admin only */}
            <Route
              path="/approvals"
              element={
                <ProtectedRoute user={user} allowedRoles={[APPROVER, FINANCE, ADMIN]}>
                  <ApprovalDashboard user={user} />
                </ProtectedRoute>
              }
            />

            {/* Goods Receiver, Finance, Admin only */}
            <Route
              path="/purchase-orders"
              element={
                <ProtectedRoute user={user} allowedRoles={[RECEIVER, FINANCE, ADMIN, REQUESTER, APPROVER]}>
                  <POTracker user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receiving"
              element={
                <ProtectedRoute user={user} allowedRoles={[RECEIVER, FINANCE, ADMIN]}>
                  <Receiving user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verification"
              element={
                <ProtectedRoute user={user} allowedRoles={[RECEIVER, ADMIN]}>
                  <GoodsVerification user={user} />
                </ProtectedRoute>
              }
            />

            {/* Procurement Admin only */}
            <Route
              path="/suppliers"
              element={<ProtectedRoute user={user} allowedRoles={[ADMIN]}><SupplierAdmin user={user} /></ProtectedRoute>}
            />
            <Route
              path="/admin-requisitions"
              element={<ProtectedRoute user={user} allowedRoles={[ADMIN]}><AdminRequisitions user={user} /></ProtectedRoute>}
            />
            <Route
              path="/approval-rules"
              element={<ProtectedRoute user={user} allowedRoles={[ADMIN]}><ApprovalRuleAdmin user={user} /></ProtectedRoute>}
            />
            <Route
              path="/roles"
              element={<ProtectedRoute user={user} allowedRoles={[ADMIN]}><RoleAdmin user={user} /></ProtectedRoute>}
            />
            <Route
              path="/users"
              element={<ProtectedRoute user={user} allowedRoles={[ADMIN]}><UserAdmin user={user} /></ProtectedRoute>}
            />
            <Route
              path="/reports"
              element={<ProtectedRoute user={user} allowedRoles={[ADMIN, FINANCE]}><ReportsDashboard user={user} /></ProtectedRoute>}
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DashboardLayout>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}

      {/* Session Timeout Monitor */}
      {isAuthenticated && <SessionTimeout user={user} onLogout={() => setUser(null)} />}
    </>
  );
}

export default App;