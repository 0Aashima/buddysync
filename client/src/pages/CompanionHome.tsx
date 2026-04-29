import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import api from '../services/api';

interface Booking {
  id: string;
  client_name: string;
  client_id: string;
  date: string;
  time: string;
  location: string;
  activity: string;
  status: string;
}

const CompanionHome = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [receivedBookings, setReceivedBookings] = useState<Booking[]>([]);
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number>(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
  const fetchRating = async () => {
    try {
      const res = await api.get('/api/auth/profile');
      setRating(res.data.user.rating);
    } catch (err) {
      console.error('Failed to fetch rating', err);
    }
  };
  fetchRating();
}, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, profileRes] = await Promise.all([
          api.get('/api/bookings/my'),
          api.get('/api/auth/profile'),
        ]);
        const all = bookingsRes.data.bookings;
        setReceivedBookings(all.filter((b: Booking) => b.status === 'pending'));
        setActiveBookings(all.filter((b: Booking) => b.status === 'confirmed' || b.status === 'active'));
        setRating(profileRes.data.user.rating);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  
  const getInitial = (name: string) => name?.charAt(0).toUpperCase() || '?';

  const BookingCard = ({ booking, showActions }: { booking: Booking; showActions: boolean }) => (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'white', border: '1px solid #E4E7EC', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #3ABEFF20, #2EC4B620)' }}
        >
          <span style={{ color: '#2EC4B6' }}>{getInitial(booking.client_name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>{booking.location}</p>
          <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{booking.activity}</p>
          <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{booking.client_name}</p>
          <p className="text-xs mt-0.5 font-medium" style={{ color: '#2EC4B6' }}>
            {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} · {booking.time?.slice(0, 5)}
          </p>
        </div>
      </div>

      {showActions ? (
  <button
    onClick={() => navigate(`/new-booking/${booking.id}`)}
    className="w-full py-2.5 rounded-full text-white text-xs font-semibold"
    style={{ background: 'linear-gradient(90deg, #1F7D97, #2EC4B6)' }}
  >
    View Booking
  </button>
) : (
  <button
    onClick={() => navigate(`/booking/${booking.id}`)}
    className="w-full py-2.5 rounded-full text-white text-xs font-semibold"
    style={{ background: 'linear-gradient(90deg, #1F7D97, #2EC4B6)' }}
  >
    View Booking
  </button>
)}
    </div>
  );

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F5F7FA' }}>

      {/* Header */}
      <div className="w-full px-4 pt-10 pb-4" style={{ background: '#F5F7FA' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img src="logo.png" alt="Logo" className="h-12 w-auto object-contain"/>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(90deg,  #1F7D97, #2EC4B6)' }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </button>
            {showDropdown && (
              <div
                className="absolute right-0 top-11 rounded-xl p-2 z-50 min-w-[160px]"
                style={{ background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid #E4E7EC' }}
              >
                <button
                  onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg"
                  style={{ color: '#1A1A1A' }}
                >
                  My Profile
                </button>
                <button
                  onClick={() => { logout(); navigate('/'); }}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg"
                  style={{ color: '#EF4444' }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#2EC4B6">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span className="text-xs" style={{ color: '#6B7280' }}>Delhi, India</span>
        </div>
      </div>

      {/* Hero banner */}
      <div
        className="mx-4 rounded-2xl px-5 py-6 mb-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F1B3D 0%, #1C2E5A 100%)' }}
      >
        <div className="relative z-10">
          <h2 className="text-white font-bold text-lg mb-1">
            Welcome Back, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-white/60 text-xs mb-4">
            {receivedBookings.length} new booking{receivedBookings.length !== 1 ? 's' : ''} waiting
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="px-5 py-2 rounded-full text-white text-xs font-semibold"
            style={{ background: 'linear-gradient(90deg,  #1F7D97, #2EC4B6)' }}
          >
            View Profile
          </button>
        </div>
        <div className="absolute right-4 top-4 w-20 h-20 rounded-full opacity-20" style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }} />
        <div className="absolute right-8 top-8 w-12 h-12 rounded-full flex items-center justify-center opacity-80" style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        </div>
      </div>

      <div className="px-4">
{/* Stats row */}
      <div className="px-4 mb-6 grid grid-cols-3 gap-3">
        {[
          { label: 'Total Bookings', value: 0 },
          { label: 'Rating', value: rating || '0.0' },
          { label: 'Status', value: 'Active' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-3 text-center"
            style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #E4E7EC' }}
          >
            <p className="font-bold text-base" style={{ color: '#1A1A1A' }}>{stat.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{stat.label}</p>
          </div>
        ))}
      </div>
        {/* Received Bookings */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>Received Bookings</h3>
            <button className="text-xs font-medium" style={{ color: '#2EC4B6' }}>View All →</button>
          </div>

          {loading ? (
            <div className="h-24 rounded-2xl animate-pulse" style={{ background: '#E4E7EC' }} />
          ) : receivedBookings.length === 0 ? (
            <div
              className="rounded-2xl p-6 flex flex-col items-center gap-2"
              style={{ background: 'white', border: '1px solid #E4E7EC' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#E4E7EC">
                <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
              </svg>
              <p className="text-sm" style={{ color: '#6B7280' }}>No new booking requests</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {receivedBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} showActions={true} />
              ))}
            </div>
          )}
        </div>

        {/* Active Bookings */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>Active Bookings</h3>
            <button className="text-xs font-medium" style={{ color: '#2EC4B6' }}>View All →</button>
          </div>

          {loading ? (
            <div className="h-24 rounded-2xl animate-pulse" style={{ background: '#E4E7EC' }} />
          ) : activeBookings.length === 0 ? (
            <div
              className="rounded-2xl p-6 flex flex-col items-center gap-2"
              style={{ background: 'white', border: '1px solid #E4E7EC' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#E4E7EC">
                <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
              </svg>
              <p className="text-sm" style={{ color: '#6B7280' }}>No active bookings yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} showActions={false} />
              ))}
            </div>
          )}
        </div>

      </div>

      <BottomNav />
    </div>
  );
};

export default CompanionHome;