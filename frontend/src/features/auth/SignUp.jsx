import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../../api.js';
import erpLogo from '../../assets/logos/erplogo.png';

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    designation: '',
    departmentId: ''
  });
  
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch departments for the dropdown without needing auth
    apiFetch('/api/departments/public')
      .then(res => setDepartments(res))
      .catch(err => {
        // Fallback or handle error
        console.error('Failed to load departments', err);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setSuccess('Registration successful! Your account is pending Admin approval.');
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register account.');
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
        maxWidth: '500px',
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
          <p style={{ color: 'var(--color-gray-dark)', margin: 0, fontSize: '15px' }}>
            Request an enterprise account
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fff2f0',
            border: '1px solid #ffccc7',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            color: '#cf1322',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span className="material-icons" style={{ fontSize: '18px' }}>error_outline</span>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#f6ffed',
            border: '1px solid #b7eb8f',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            color: '#389e0d',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span className="material-icons" style={{ fontSize: '18px' }}>check_circle</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--color-black)', marginBottom: '8px' }}>Full Name *</label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                required 
                className="zoho-input" 
                placeholder="John Doe" 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--color-black)', marginBottom: '8px' }}>Employee ID *</label>
              <input 
                type="text" 
                name="employeeId" 
                value={formData.employeeId} 
                onChange={handleChange} 
                required 
                className="zoho-input" 
                placeholder="EMP001" 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--color-black)', marginBottom: '8px' }}>Email Address *</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="zoho-input" 
                placeholder="john@enterprise.com" 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--color-black)', marginBottom: '8px' }}>Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className="zoho-input" 
                placeholder="+1 555-0199" 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--color-black)', marginBottom: '8px' }}>Designation *</label>
              <input 
                type="text" 
                name="designation" 
                value={formData.designation} 
                onChange={handleChange} 
                required 
                className="zoho-input" 
                placeholder="e.g. Software Engineer" 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--color-black)', marginBottom: '8px' }}>Department *</label>
              <select 
                name="departmentId" 
                value={formData.departmentId} 
                onChange={handleChange} 
                required 
                className="zoho-input"
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--color-black)', marginBottom: '8px' }}>Username *</label>
              <input 
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                required 
                className="zoho-input" 
                placeholder="johndoe" 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--color-black)', marginBottom: '8px' }}>Password *</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                className="zoho-input" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="zoho-btn zoho-btn-primary" 
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Request Account'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
          <span style={{ color: 'var(--color-gray)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
