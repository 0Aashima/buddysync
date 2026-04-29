import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GradientBackground from '../components/GradientBackground';
import GlassCard from '../components/GlassCard';
import InputField from '../components/InputField';
import GradientButton from '../components/GradientButton';
import GradientCheckbox from '../components/GradientCheckbox';
import api from '../services/api';

const getPasswordStrength = (password: string) => {
  if (password.length === 0) return null;
  if (password.length < 6) return { label: 'Too short — minimum 6 characters', color: '#EF4444' };
  if (password.length < 8) return { label: 'Weak — try adding numbers or symbols', color: '#F59E0B' };
  if (/^[a-zA-Z]+$/.test(password)) return { label: 'Fair — add numbers or symbols', color: '#F59E0B' };
  if (password.length >= 8 && /[0-9]/.test(password)) return { label: 'Good password', color: '#22C55E' };
  return { label: 'Strong password', color: '#2EC4B6' };
};

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    password: '',
    role: '' as 'client' | 'companion' | '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email address';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone)) newErrors.phone = 'Enter a valid 10-digit phone number';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!form.age) newErrors.age = 'Age is required';
    else if (parseInt(form.age) < 18) newErrors.age = 'You must be at least 18 years old';
    if (!form.gender) newErrors.gender = 'Please select your gender';
    if (!form.role) newErrors.role = 'Please select Client or Companion';
    return newErrors;
  };

  const handleSignup = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      setLoading(true);
      await api.post('/api/auth/signup', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        age: parseInt(form.age),
        gender: form.gender,
        password: form.password,
        role: form.role,
      });
      navigate('/login');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (msg === 'Email already registered') {
        setErrors({ email: 'This email is already registered. Try logging in.' });
      } else if (err.response?.data?.errors) {
        const backendErrors: Record<string, string> = {};
        err.response.data.errors.forEach((e: any) => {
          backendErrors.general = e.msg;
        });
        setErrors(backendErrors);
      } else {
        setErrors({ general: msg || 'Something went wrong. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(form.password);

  return (
    <GradientBackground>
      <div className="flex flex-col" style={{ minHeight: '100dvh' }}>
        <div className="px-8 pt-16 pb-8 flex-shrink-0">
          <h1 className="text-white text-4xl font-bold mb-1">Create Your</h1>
          <h1 className="text-white text-4xl font-bold">Account</h1>
        </div>

        <div className="flex-1">
          <GlassCard>
            <InputField
              label="Name"
              placeholder="Enter your full name here"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
            {errors.name && <p className="text-red-400 text-xs -mt-4 mb-4">{errors.name}</p>}

            <InputField
              label="Phone"
              placeholder="Enter your 10-digit mobile number"
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
            {errors.phone && <p className="text-red-400 text-xs -mt-4 mb-4">{errors.phone}</p>}

            <InputField
              label="Email"
              placeholder="Enter your email here"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
            {errors.email && <p className="text-red-400 text-xs -mt-4 mb-4">{errors.email}</p>}

            <InputField
              label="Password"
              placeholder="Enter your password here"
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
            {passwordStrength && (
              <p className="text-xs -mt-4 mb-4 font-medium" style={{ color: passwordStrength.color }}>
                {passwordStrength.label}
              </p>
            )}
            {errors.password && <p className="text-red-400 text-xs -mt-4 mb-4">{errors.password}</p>}

            <InputField
              label="Age"
              placeholder="Enter your age"
              type="number"
              value={form.age}
              onChange={(e) => update('age', e.target.value)}
            />
            {errors.age && <p className="text-red-400 text-xs -mt-4 mb-4">{errors.age}</p>}

            <div className="flex flex-col gap-1 mb-6">
              <label className="text-white font-semibold text-base">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => update('gender', e.target.value)}
                className="bg-transparent border-b border-white/30 text-white/60 text-sm py-2 outline-none"
              >
                <option value="" disabled className="bg-[#1C2E5A]">Select gender</option>
                <option value="male" className="bg-[#1C2E5A]">Male</option>
                <option value="female" className="bg-[#1C2E5A]">Female</option>
                <option value="other" className="bg-[#1C2E5A]">Other</option>
              </select>
            </div>
            {errors.gender && <p className="text-red-400 text-xs -mt-4 mb-4">{errors.gender}</p>}

            <div className="flex gap-6 mb-2">
              <GradientCheckbox
                checked={form.role === 'client'}
                onChange={() => update('role', 'client')}
                label="Client"
              />
              <GradientCheckbox
                checked={form.role === 'companion'}
                onChange={() => update('role', 'companion')}
                label="Companion"
              />
            </div>
            {errors.role && <p className="text-red-400 text-xs mb-4">{errors.role}</p>}

            {errors.general && <p className="text-red-400 text-xs mb-2">{errors.general}</p>}

            <GradientButton label="Sign Up" onClick={handleSignup} loading={loading} />

            <p className="text-white/50 text-sm text-center mt-6">
              Already have an account?{' '}
              <span className="text-[#2EC4B6] cursor-pointer font-semibold" onClick={() => navigate('/login')}>
                Log In
              </span>
            </p>
          </GlassCard>
        </div>
      </div>
    </GradientBackground>
  );
};

export default Signup;