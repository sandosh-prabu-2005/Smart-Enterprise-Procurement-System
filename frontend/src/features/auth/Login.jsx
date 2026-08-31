import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/authApi';
import { normalizeRoles, getPrimaryRole, getDefaultRouteForRole } from '../../utils/roles';
import erpLogo from '../../assets/logos/erplogo.png';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  
  // Retrieve cached username if Remember Me was selected previously
  const savedUsername = localStorage.getItem('remembered_username') || '';
  const [credentials, setCredentials] = useState({ username: savedUsername, password: '' });
  const [rememberMe, setRememberMe] = useState(!!savedUsername);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(credentials);
      const token = response.accessToken;
      const roles = normalizeRoles(response.roles);
      const primaryRole = getPrimaryRole(roles);

      const user = {
        username: response.username || credentials.username,
        token,
        role: primaryRole,
        roles,
        userId: response.userId,
        fullName: response.fullName,
        departmentId: response.departmentId,
        departmentName: response.departmentName,
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (rememberMe) {
        localStorage.setItem('remembered_username', credentials.username);
      } else {
        localStorage.removeItem('remembered_username');
      }

      if (onLogin) onLogin(user);
      navigate(getDefaultRouteForRole(primaryRole));
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid corporate username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-color)',
      fontFamily: 'var(--font-body)',
      padding: '20px'
    }}>
      <div className="zoho-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--border-radius-card)',
        boxShadow: 'var(--shadow-soft)'
      }}>
        {/* Branding Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img 
            src={erpLogo} 
            alt="Enterprise Logo" 
            style={{ 
              height: '72px', 
              maxWidth: '100%', 
              objectFit: 'contain',
              marginBottom: '16px' 
            }} 
          />
          <h2 className="logo-title-font" style={{
            fontSize: '24px',
            color: 'var(--color-black)',
            margin: '0 0 6px 0',
            letterSpacing: '0.02em'
          }}>
            Enterprise Procurement
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
            Enterprise Source-to-Pay Platform
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '20px',
            border: '1px solid #fca5a5',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--color-black)',
              marginBottom: '6px'
            }}>
              Corporate Username
            </label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              placeholder="e.g. employee.name"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'var(--font-body)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--color-black)'
              }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-color)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  outline: 'none'
                }}
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'var(--font-body)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>

          {/* Remember me toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                cursor: 'pointer',
                accentColor: 'var(--primary-color)'
              }}
            />
            <label htmlFor="rememberMe" style={{
              fontSize: '13px',
              color: '#4b5563',
              cursor: 'pointer',
              userSelect: 'none'
            }}>
              Remember corporate username
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-enterprise primary"
            style={{ width: '100%', marginTop: '6px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(17, 24, 39, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="zoho-card" style={{
            width: '100%',
            maxWidth: '400px',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--border-radius-card)',
            padding: '32px',
            boxShadow: 'var(--shadow-hover)',
            border: 'none',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
              Credentials Recovery
            </h3>
            <p style={{
              fontSize: '13px',
              color: '#4b5563',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              To maintain system compliance and authorization audits, credentials are managed by identity services. Please raise an IT service ticket or contact your system administrator at: <br />
              <strong style={{ color: 'var(--primary-color)', display: 'block', marginTop: '8px' }}>
                admin@enterprise.com
              </strong>
            </p>
            <button
              onClick={() => setShowForgotModal(false)}
              className="btn-enterprise primary"
              style={{ width: '100%', height: '40px' }}
            >
              Close instructions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}