import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import api from '../services/api';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  age: number;
  gender: string;
  kyc_status: string;
  aadhaar_verified: boolean;
  rating: number;
  specialization: string;
  height?: string;
  bio?: string;
}
const calculateCompletion = (profile: ProfileData): number => {
  const baseFields = [profile.name, profile.email, profile.phone, profile.age, profile.gender];
  const companionFields = profile.role === 'companion'
    ? [profile.specialization, profile.height, profile.bio, profile.aadhaar_verified]
    : [profile.aadhaar_verified];
  const allFields = [...baseFields, ...companionFields];
  const filled = allFields.filter(Boolean).length;
  return Math.round((filled / allFields.length) * 100);
};

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
  name: '', phone: '', age: '', gender: '', specialization: '', height: '', bio: ''
});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/auth/profile');
      setProfile(res.data.user);
      setEditForm({
  name: res.data.user.name || '',
  phone: res.data.user.phone || '',
  age: res.data.user.age?.toString() || '',
  gender: res.data.user.gender || '',
  specialization: res.data.user.specialization || '',
  height: res.data.user.height || '',
  bio: res.data.user.bio || '',
});
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.patch('/api/auth/profile', {
  name: editForm.name,
  phone: editForm.phone,
  age: parseInt(editForm.age),
  gender: editForm.gender,
  specialization: editForm.specialization || null,
  height: editForm.height || null,
  bio: editForm.bio || null,
});
      setSaveMessage('Profile updated successfully!');
      await fetchProfile();
      setTimeout(() => {
        setShowEdit(false);
        setSaveMessage('');
      }, 1500);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
  try {
    await api.delete('/api/auth/account');
    logout();
    navigate('/');
  } catch (err) {
    console.error('Delete failed', err);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F7FA' }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#2EC4B6', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!profile) return null;

  const completion = calculateCompletion(profile);

  const menuItems = [
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      ),
      label: 'My Ratings',
      color: '#1A1A1A',
      onClick: () => navigate('/ratings'),
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#2EC4B6">
          <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
        </svg>
      ),
      label: 'Transaction History',
      color: '#1A1A1A',
      onClick: () => navigate('/payments'),
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      ),
      label: 'Upgrade Plan',
      color: '#2EC4B6',
      onClick: () => navigate('/upgrade'),
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#6B7280">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
        </svg>
      ),
      label: 'Settings',
      color: '#1A1A1A',
      onClick: () => navigate('/settings'),
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#2EC4B6">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
      ),
      label: 'About Buddy4day',
      color: '#1A1A1A',
      onClick: () => navigate('/about'),
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4444">
          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
        </svg>
      ),
      label: 'Logout',
      color: '#EF4444',
      onClick: () => { logout(); navigate('/'); },
    },
    {
  icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4444">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>
  ),
  label: 'Delete Account',
  color: '#EF4444',
  onClick: () => setShowDeleteModal(true),
},
  ];

  if (showEdit) {
    return (
      <div className="min-h-screen pb-24" style={{ background: '#F5F7FA' }}>
        <div
          className="w-full px-4 pt-10 pb-4 flex items-center gap-3"
          style={{ background: 'white', borderBottom: '1px solid #E4E7EC' }}
        >
          <button onClick={() => setShowEdit(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A1A1A">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <h2 className="font-semibold text-base" style={{ color: '#1A1A1A' }}>Edit Profile</h2>
        </div>

        <div className="px-4 py-6 flex flex-col gap-5">
          {/* Non-editable email display */}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>Email (cannot be changed)</label>
            <div
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ background: '#F5F7FA', border: '1px solid #E4E7EC', color: '#6B7280' }}
            >
              {profile.email}
            </div>
          </div>

          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Enter your full name' },
            { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: 'Enter your phone number' },
            { label: 'Age', key: 'age', type: 'number', placeholder: 'Enter your age' },
          ].map((field) => (
            <div key={field.key}>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>{field.label}</label>
              <input
                type={field.type}
                value={editForm[field.key as keyof typeof editForm]}
                onChange={(e) => setEditForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 rounded-xl outline-none text-sm"
                style={{ background: 'white', border: '1px solid #E4E7EC', color: '#1A1A1A' }}
              />
            </div>
          ))}

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>Gender</label>
            <select
              value={editForm.gender}
              onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl outline-none text-sm"
              style={{ background: 'white', border: '1px solid #E4E7EC', color: '#1A1A1A' }}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {profile.role === 'companion' && (
  <>
    <div>
      <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>Specialization</label>
      <input
        type="text"
        value={editForm.specialization}
        onChange={(e) => setEditForm(prev => ({ ...prev, specialization: e.target.value }))}
        placeholder="e.g. Food & Dining, Travel & Tours"
        className="w-full px-4 py-3 rounded-xl outline-none text-sm"
        style={{ background: 'white', border: '1px solid #E4E7EC', color: '#1A1A1A' }}
      />
    </div>
    <div>
      <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>Height</label>
      <input
        type="text"
        value={editForm.height}
        onChange={(e) => setEditForm(prev => ({ ...prev, height: e.target.value }))}
        placeholder="e.g. 5'5 or 165cm"
        className="w-full px-4 py-3 rounded-xl outline-none text-sm"
        style={{ background: 'white', border: '1px solid #E4E7EC', color: '#1A1A1A' }}
      />
    </div>
    <div>
      <label className="text-xs font-medium mb-1 block" style={{ color: '#6B7280' }}>Bio</label>
      <textarea
        value={editForm.bio}
        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
        placeholder="Tell clients a little about yourself..."
        rows={3}
        className="w-full px-4 py-3 rounded-xl outline-none text-sm resize-none"
        style={{ background: 'white', border: '1px solid #E4E7EC', color: '#1A1A1A' }}
      />
    </div>
  </>
)}

          {saveMessage && (
            <div
              className="px-4 py-3 rounded-xl"
              style={{ background: 'rgba(46,196,182,0.1)', border: '1px solid #2EC4B6' }}
            >
              <p className="text-xs font-medium" style={{ color: '#2EC4B6' }}>{saveMessage}</p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-full text-white font-semibold text-sm"
            style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F5F7FA' }}>

      {/* Profile header */}
      <div className="px-4 pt-12 pb-6" style={{ background: 'white' }}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>{profile.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
              +91 {profile.phone?.replace(/(\d{3})(\d{3})(\d{4})/, 'XXX-XXX-$3') || 'XXXXXXXXXX'}
            </p>
            <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>{profile.email}</p>
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
            style={{ border: '1px solid #E4E7EC', color: '#1A1A1A', background: 'white' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#1A1A1A">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            Edit
          </button>
        </div>

        {/* Profile completion */}
        <div className="mt-3">
          <div className="flex items-center gap-1 mb-1.5">
            <span
              className="text-xs font-semibold"
              style={{ color: completion === 100 ? '#2EC4B6' : '#F59E0B' }}
            >
              Profile {completion}% complete.
            </span>
            {completion < 100 && (
              <button
                onClick={() => setShowEdit(true)}
                className="text-xs"
                style={{ color: '#6B7280' }}
              >
                Complete now
              </button>
            )}
          </div>
          <div className="w-full rounded-full h-1.5" style={{ background: '#E4E7EC' }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${completion}%`,
                background: completion === 100
                  ? 'linear-gradient(90deg, #3ABEFF, #2EC4B6)'
                  : 'linear-gradient(90deg, #F59E0B, #EF4444)',
              }}
            />
          </div>
        </div>

        {/* Aadhaar verification status */}
        <div className="mt-3">
          {profile.aadhaar_verified ? (
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#22C55E">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <span className="text-xs font-medium" style={{ color: '#22C55E' }}>
                Aadhaar verified
              </span>
            </div>
          ) : (
            <button
              onClick={() => navigate('/kyc')}
              className="flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#EF4444">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span className="text-xs font-medium" style={{ color: '#EF4444' }}>
                Aadhaar not verified —{' '}
                <span style={{ color: '#2EC4B6', textDecoration: 'underline' }}>
                  Verify now
                </span>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Quick action cards */}
      <div className="px-4 py-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/bookings')}
          className="rounded-2xl p-4 flex flex-col items-center gap-2"
          style={{ background: 'white', border: '1px solid #E4E7EC', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ border: '1.5px solid #E4E7EC' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A1A1A">
              <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-center" style={{ color: '#1A1A1A' }}>My Bookings</span>
        </button>

        <button
          onClick={() => navigate('/support')}
          className="rounded-2xl p-4 flex flex-col items-center gap-2"
          style={{ background: 'white', border: '1px solid #E4E7EC', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ border: '1.5px solid #E4E7EC' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A1A1A">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
            </svg>
          </div>
          <span className="text-xs font-medium text-center" style={{ color: '#1A1A1A' }}>Help and Support</span>
        </button>
      </div>

      {/* Menu items */}
      <div className="px-4">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #E4E7EC' }}>
          {menuItems.map((item, index) => (
            <div key={item.label}>
              <button
                onClick={item.onClick}
                className="w-full flex items-center justify-between px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm font-medium" style={{ color: item.color }}>{item.label}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#6B7280">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </button>
              {index < menuItems.length - 1 && (
                <div className="h-px mx-4" style={{ background: '#F5F7FA' }} />
              )}
            </div>
          ))}
        </div>
      </div>
{showDeleteModal && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center px-6"
    style={{ background: 'rgba(0,0,0,0.5)' }}
  >
    <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: 'white' }}>
      <h3 className="text-lg font-bold mb-2 text-center" style={{ color: '#1A1A1A' }}>Delete Account?</h3>
      <p className="text-sm text-center mb-6" style={{ color: '#6B7280' }}>
        This will permanently delete your account, all your data, and any pending payments. This cannot be undone.
      </p>
      <button
        onClick={handleDeleteAccount}
        className="w-full py-3 rounded-full text-white font-semibold text-sm mb-3"
        style={{ background: '#EF4444' }}
      >
        Yes, Delete My Account
      </button>
      <button
        onClick={() => setShowDeleteModal(false)}
        className="w-full py-3 text-sm font-medium"
        style={{ color: '#6B7280' }}
      >
        Cancel
      </button>
    </div>
  </div>
)}
      <BottomNav />
    </div>
  );
};

export default Profile;