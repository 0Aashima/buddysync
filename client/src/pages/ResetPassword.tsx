import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GradientBackground from '../components/GradientBackground';
import GlassCard from '../components/GlassCard';
import InputField from '../components/InputField';
import GradientButton from '../components/GradientButton';
import api from '../services/api';

const getPasswordStrength = (password: string) => {
  if (password.length === 0) return null;
  if (password.length < 6) return { label: 'Too short — minimum 6 characters', color: '#EF4444' };
  if (password.length < 8) return { label: 'Weak — try adding numbers or symbols', color: '#F59E0B' };
  if (/^[a-zA-Z]+$/.test(password)) return { label: 'Fair — add numbers or symbols', color: '#F59E0B' };
  if (password.length >= 8 && /[0-9]/.test(password)) return { label: 'Good password', color: '#22C55E' };
  return { label: 'Strong password', color: '#2EC4B6' };
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordStrength = getPasswordStrength(newPassword);

  const handleReset = async () => {
    if (!newPassword) { setError('Please enter a new password'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!token) { setError('Invalid reset link'); return; }
    try {
      setLoading(true);
      setError('');
      await api.post('/api/auth/reset-password', { token, newPassword });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <GradientBackground>
        <div className="flex flex-col items-center justify-center h-full px-8 text-center">
          <p className="text-white text-lg font-semibold mb-4">Invalid reset link</p>
          <button onClick={() => navigate('/login')} className="text-[#2EC4B6] text-sm">Back to Login</button>
        </div>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <div className="flex flex-col h-full">
        <div className="px-8 pt-16 pb-8 flex-shrink-0">
          <h1 className="text-white text-4xl font-bold mb-1">Reset</h1>
          <h1 className="text-white text-4xl font-bold">Password</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <GlassCard>
            {success ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <p className="text-white font-semibold text-center">Password reset successfully!</p>
                <p className="text-white/50 text-xs text-center">You can now log in with your new password.</p>
                <GradientButton label="Go to Login" onClick={() => navigate('/login')} />
              </div>
            ) : (
              <>
                <p className="text-white/50 text-xs mb-6">Enter your new password below.</p>
                <InputField
                  label="New Password"
                  placeholder="Enter your new password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                />
                {passwordStrength && (
                  <p className="text-xs -mt-4 mb-4 font-medium" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </p>
                )}
                {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
                <GradientButton label="Reset Password" onClick={handleReset} loading={loading} />
              </>
            )}
          </GlassCard>
        </div>
      </div>
    </GradientBackground>
  );
};

export default ResetPassword;