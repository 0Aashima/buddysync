import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GradientBackground from '../components/GradientBackground';
import GlassCard from '../components/GlassCard';
import InputField from '../components/InputField';
import GradientButton from '../components/GradientButton';
import GradientCheckbox from '../components/GradientCheckbox';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      setEmail(remembered);
      setRemember(true);
    }
  }, []);

  const handleLogin = async () => {
    if (!email) { setError('Please enter your email'); return; }
    if (!password) { setError('Please enter your password'); return; }
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/api/auth/login', { email, password });
      if (remember) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      login(res.data.token, res.data.user);
      const { role } = res.data.user;
login(res.data.token, res.data.user);
if (role === 'companion') {
  navigate('/companion-home');
} else if (role === 'admin') {
  navigate('/admin');
} else {
  navigate('/home');
}
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (msg === 'Invalid credentials') {
        setError('Incorrect email or password. Please try again.');
      } else if (err.response?.status === 429) {
        setError('Too many attempts. Please wait 15 minutes and try again.');
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async () => {
  if (!resetEmail) { setResetError('Please enter your email'); return; }
  try {
    setResetLoading(true);
    setResetError('');
    await api.post('/api/auth/forgot-password', { email: resetEmail });
    setResetMessage('Check your email for a reset link. It expires in 1 hour.');
  } catch (err: any) {
    setResetError(err.response?.data?.message || 'Something went wrong');
  } finally {
    setResetLoading(false);
  }
};

  if (showReset) {
  return (
    <GradientBackground>
      <div className="flex flex-col h-full">
        <div className="px-8 pt-16 pb-8 flex-shrink-0">
          <button onClick={() => setShowReset(false)} className="mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <h1 className="text-white text-4xl font-bold mb-1">Forgot</h1>
          <h1 className="text-white text-4xl font-bold">Password?</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <GlassCard>
            <p className="text-white/50 text-xs mb-6">
              Enter your registered email and we'll send you a secure reset link.
            </p>
            <InputField
              label="Email"
              placeholder="Enter your registered email"
              type="email"
              value={resetEmail}
              onChange={(e) => { setResetEmail(e.target.value); setResetError(''); }}
            />
            {resetError && <p className="text-red-400 text-xs mb-2">{resetError}</p>}
            {resetMessage && (
              <div
                className="rounded-xl p-3 mb-4"
                style={{ background: 'rgba(46,196,182,0.15)', border: '1px solid #2EC4B6' }}
              >
                <p className="text-[#2EC4B6] text-xs">{resetMessage}</p>
              </div>
            )}
            {!resetMessage && (
              <GradientButton label="Send Reset Link" onClick={handleResetRequest} loading={resetLoading} />
            )}
            {resetMessage && (
              <button
                onClick={() => setShowReset(false)}
                className="w-full py-4 rounded-full text-white font-semibold text-base mt-4"
                style={{ background: 'linear-gradient(90deg, #3ABEFF 0%, #2EC4B6 100%)' }}
              >
                Back to Login
              </button>
            )}
          </GlassCard>
        </div>
      </div>
    </GradientBackground>
  );
}
  return (
    <GradientBackground>
      <div className="flex flex-col h-full">
        <div className="px-8 pt-16 pb-8 flex-shrink-0">
          <h1 className="text-white text-4xl font-bold mb-1">Welcome</h1>
          <h1 className="text-white text-4xl font-bold">Back!</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <GlassCard>
            <InputField
              label="Email"
              placeholder="Enter your email here"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
            />
            <InputField
              label="Password"
              placeholder="Enter your password here"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
            />
            <div className="flex items-center justify-between mb-4">
              <GradientCheckbox
                checked={remember}
                onChange={() => setRemember(!remember)}
                label="Remember me"
              />
              <button
                onClick={() => setShowReset(true)}
                className="text-xs font-medium"
                style={{ color: '#2EC4B6' }}
              >
                Forgot password?
              </button>
            </div>
            {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
            <GradientButton label="Log In" onClick={handleLogin} loading={loading} />
            <p className="text-white/50 text-sm text-center mt-6">
              Don't have an account?{' '}
              <span className="text-[#2EC4B6] cursor-pointer font-semibold" onClick={() => navigate('/signup')}>
                Sign Up
              </span>
            </p>
          </GlassCard>
        </div>
      </div>
    </GradientBackground>
  );
};

export default Login;