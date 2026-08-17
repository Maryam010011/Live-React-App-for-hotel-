import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateName, validateEmail } from '../utils/validation';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Field validation state
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; password?: boolean }>({});
  const [fieldErrors, setFieldErrors] = useState<{ name?: string | null; email?: string | null; password?: string | null }>({});

  const handleBlur = (field: 'name' | 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'name') {
      setFieldErrors((prev) => ({ ...prev, name: validateName(name, 'Full name') }));
    } else if (field === 'email') {
      setFieldErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    } else if (field === 'password') {
      const passErr = password.length < 6 ? 'Password must be at least 6 characters.' : null;
      setFieldErrors((prev) => ({ ...prev, password: passErr }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const nameErr = validateName(name, 'Full name');
    const emailErr = validateEmail(email);
    const passErr = password.length < 6 ? 'Password must be at least 6 characters.' : null;

    setTouched({ name: true, email: true, password: true });
    setFieldErrors({ name: nameErr, email: emailErr, password: passErr });

    if (nameErr || emailErr || passErr) return;

    setLoading(true);
    try {
      await register(name, email, password);
      navigate(redirectTarget);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#d97706" strokeWidth="2">
              <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join LuxeStay and start exploring luxury hotels</p>
        </div>

        {searchParams.get('redirect') && (
          <div className="auth-info-banner">
            Create an account to complete your reservation.
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              required
              placeholder="John Doe"
              className={touched.name && fieldErrors.name ? 'input-has-error' : ''}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (touched.name) {
                  setFieldErrors((prev) => ({ ...prev, name: validateName(e.target.value, 'Full name') }));
                }
              }}
              onBlur={() => handleBlur('name')}
              autoComplete="name"
            />
            {touched.name && fieldErrors.name && (
              <span className="field-error-msg">{fieldErrors.name}</span>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              required
              placeholder="you@example.com"
              className={touched.email && fieldErrors.email ? 'input-has-error' : ''}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched.email) {
                  setFieldErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                }
              }}
              onBlur={() => handleBlur('email')}
              autoComplete="email"
            />
            {touched.email && fieldErrors.email && (
              <span className="field-error-msg">{fieldErrors.email}</span>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              required
              placeholder="Minimum 6 characters"
              minLength={6}
              className={touched.password && fieldErrors.password ? 'input-has-error' : ''}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (touched.password) {
                  const pErr = e.target.value.length < 6 ? 'Password must be at least 6 characters.' : null;
                  setFieldErrors((prev) => ({ ...prev, password: pErr }));
                }
              }}
              onBlur={() => handleBlur('password')}
              autoComplete="new-password"
            />
            {touched.password && fieldErrors.password && (
              <span className="field-error-msg">{fieldErrors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to={`/login${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
