import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, KeyRound, LogOut, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ProfileSettings({ user, onLogout }) {
  const navigate = useNavigate();

  const [passwordFields, setPasswordFields] = useState({ current: '', next: '', confirm: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (passwordFields.next !== passwordFields.confirm) {
      setErrorMsg('New password and confirmation password do not match.');
      return;
    }

    if (passwordFields.next.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setSuccessMsg('Your corporate account password has been updated in directory context.');
    setPasswordFields({ current: '', next: '', confirm: '' });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout(null);
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="page-title">Profile & Preferences</h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
          Review Cost Center cost limits, role authorizations, and maintain password credentials
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        alignItems: 'flex-start'
      }}>
        {/* Account Details Card */}
        <div className="zoho-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--color-black)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px',
            margin: 0
          }}>
            Corporate Identity
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={28} />
            </div>
            <div>
              <strong style={{ fontSize: '16px', color: 'var(--color-black)', display: 'block' }}>
                {user?.fullName || user?.username}
              </strong>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Corporate Directory Active Account</span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            fontSize: '13px',
            backgroundColor: 'var(--bg-color)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div>
              <span style={{ color: '#6b7280', display: 'block', marginBottom: '2px' }}>Username</span>
              <strong style={{ color: 'var(--color-black)' }}>{user?.username}</strong>
            </div>
            <div>
              <span style={{ color: '#6b7280', display: 'block', marginBottom: '2px' }}>Authorization Level</span>
              <strong style={{ color: 'var(--color-black)' }}>{user?.role}</strong>
            </div>
            <div>
              <span style={{ color: '#6b7280', display: 'block', marginBottom: '2px' }}>Organization Unit</span>
              <strong style={{ color: 'var(--color-black)' }}>{user?.departmentName || 'Central Operations'}</strong>
            </div>
            <div>
              <span style={{ color: '#6b7280', display: 'block', marginBottom: '2px' }}>Cost Center Code</span>
              <strong style={{ color: 'var(--color-black)' }}>CC-{user?.departmentId || '101'}</strong>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleLogout}
              className="btn-enterprise danger"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '40px' }}
            >
              <LogOut size={16} />
              <span>Sign Out Session</span>
            </button>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="zoho-card">
          <h2 style={{
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--color-black)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '12px',
            margin: '0 0 20px 0'
          }}>
            Change Password
          </h2>

          {successMsg && (
            <div style={{
              backgroundColor: '#ecfdf5',
              color: 'var(--color-approved)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #d1fae5'
            }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}
          
          {errorMsg && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: 'var(--color-rejected)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #fee2e2'
            }}>
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-black)', marginBottom: '6px' }}>
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwordFields.current}
                onChange={(e) => setPasswordFields({ ...passwordFields, current: e.target.value })}
                placeholder="Enter current password"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'var(--font-body)'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-black)', marginBottom: '6px' }}>
                New Password
              </label>
              <input
                type="password"
                required
                value={passwordFields.next}
                onChange={(e) => setPasswordFields({ ...passwordFields, next: e.target.value })}
                placeholder="Minimum 6 characters"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'var(--font-body)'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--color-black)', marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passwordFields.confirm}
                onChange={(e) => setPasswordFields({ ...passwordFields, confirm: e.target.value })}
                placeholder="Verify new password"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'var(--font-body)'
                }}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn-enterprise primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '40px' }}
              >
                <KeyRound size={16} />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
