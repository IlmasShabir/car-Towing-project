import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiUser,
  FiArrowLeft,
  FiShield,
} from 'react-icons/fi';
import { adminLogin, setAdminToken } from '../../api/adminApi';
import './AdminLogin.css';
import logo from '../../assets/images/logo (1).webp';

const AdminLogin = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { token } = await adminLogin(form.username, form.password);
      setAdminToken(token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-page">
      <div className="al-grid">
        {/* Brand panel */}
        <div className="al-brand-panel">
          <Link to="/" className="al-back-link">
            <FiArrowLeft /> Back to website
          </Link>
          <div className="al-brand-content">
            <img src={logo} alt="Usama Car Towing" className="al-logo" />
            <h1>Usama Car Towing</h1>
            <p>
              24/7 towing &amp; roadside assistance across Dubai. Manage bookings,
              services, reviews and notifications from one place.
            </p>
            <div className="al-features">
              <div className="al-feature">
                <span className="al-feature-icon">
                  <FiShield />
                </span>
                <div>
                  <strong>Secure access</strong>
                  <span>Role-based admin accounts</span>
                </div>
              </div>
            </div>
          </div>
          <div className="al-brand-foot">
            © {new Date().getFullYear()} Usama Car Towing · Dubai
          </div>
        </div>

        {/* Form panel */}
        <div className="al-form-panel">
          <div className="al-form-card">
            <div className="al-form-head">
              <h2>Welcome back</h2>
              <p>Sign in to the admin panel</p>
            </div>

            {error && (
              <div className="al-error" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="al-field">
                <label htmlFor="al-username">Username</label>
                <div className="al-input-wrap">
                  <span className="al-input-icon"><FiUser /></span>
                  <input
                    id="al-username"
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={handleChange}
                    autoComplete="username"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="al-field">
                <label htmlFor="al-password">Password</label>
                <div className="al-input-wrap">
                  <span className="al-input-icon"><FiLock /></span>
                  <input
                    id="al-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="al-eye"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <button type="submit" className="al-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="al-spinner" /> Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="al-hint">
              Protected area. Authorized staff only.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;