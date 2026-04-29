import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import CompanionCard from '../components/CompanionCard';
import api from '../services/api';
import LocationModal from '../components/LocationModal';

interface Companion {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  kyc_status: string;
  is_online: boolean;
}

interface Booking {
  id: string;
  companion_name: string;
  client_name: string;
  location: string;
  activity: string;
  specialization: string;
  date: string;
  time: string;
  status: string;
  companion_id: string;
  client_id: string;
}

const activities = [
  {
    label: 'Outdoor & Adventure', value: 'Outdoor & Adventure',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>
  },
  {
    label: 'Sports & Fitness', value: 'Sports & Fitness',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5S3.1 13.5 5 13.5 8.5 15.1 8.5 17 6.9 20.5 5 20.5zm11.5-1c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm0-8.5c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zM10.2 8.6l-1.5-1.5C8 6.4 7.1 6 6.1 6H2v2h4.1c.5 0 .9.2 1.2.5l1.5 1.5 1.4-1.4z"/></svg>
  },
  {
    label: 'Cultural & Learning', value: 'Cultural & Learning',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>
  },
  {
    label: 'Entertainment', value: 'Entertainment & Events',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/></svg>
  },
  {
    label: 'Social & Hangouts', value: 'Social & Casual Hangouts',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
  },
  {
    label: 'Special Occasions', value: 'Special Occasions / Support',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
  },
  {
    label: 'Hobby & Skills', value: 'Hobby & Skill Sharing',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M7 5h10v2l2-2V3H5v4l2 2V5zm10 14H7v-2l-2 2v2h14v-4l-2-2v4zM3 7l-2 2v6l2 2V7zm18 0v10l2-2V9l-2-2zm-8 9c1.86 0 3.41-1.28 3.86-3H12v-2h5c0-.17.01-.33.01-.5 0-2.76-2.24-5-5-5s-5 2.24-5 5 2.24 5 5 5z"/></svg>
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [nearbyCompanions, setNearbyCompanions] = useState<Companion[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ label: string; lat: number; lng: number } | null>(() => {
    const saved = localStorage.getItem('userLocation');
    return saved ? JSON.parse(saved) : null;
  });
  const [showLocationModal, setShowLocationModal] = useState(!localStorage.getItem('userLocation'));

  const handleLocationSet = (label: string, lat: number, lng: number) => {
    const loc = { label, lat, lng };
    localStorage.setItem('userLocation', JSON.stringify(loc));
    setLocation(loc);
    setShowLocationModal(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companionsRes, upcomingRes] = await Promise.all([
          api.get('/api/companions?sortByRating=true'),
          api.get('/api/bookings/upcoming'),
        ]);
        setCompanions(companionsRes.data.companions.slice(0, 3));
        setUpcomingBookings(upcomingRes.data.bookings);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchNearby = async () => {
      if (!location || location.lat === 0) return;
      try {
        const res = await api.get(`/api/companions/nearby?lat=${location.lat}&lng=${location.lng}`);
        setNearbyCompanions(res.data.companions);
      } catch (err) {
        console.error('Failed to fetch nearby', err);
      }
    };
    fetchNearby();
  }, [location]);

  const handleActivity = (value: string) => {
    navigate(`/companions?specialization=${encodeURIComponent(value)}`);
  };

  return (
    <div className="min-h-screen" style={{ background: '#F5F7FA' }}>
      <Header
        onSearch={() => {}}
        location={location?.label || 'Set location'}
        onLocationClick={() => setShowLocationModal(true)}
      />

      {/* Hero banner */}
      <div
        className="w-full px-6 py-10 flex flex-col items-start relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F1B3D 0%, #1C2E5A 100%)' }}
      >
        <div className="relative z-10">
          <h2 className="text-white text-2xl font-bold mb-1">Your Buddy Awaits</h2>
          <p className="text-white/60 text-xs mb-5">Find your perfect companion for any activity</p>
          <button
            onClick={() => navigate('/companions')}
            className="px-6 py-2.5 rounded-full text-white font-semibold text-sm"
            style={{ background: 'linear-gradient(90deg,  #1F7D97, #2EC4B6)', boxShadow: '0 4px 15px rgba(0,0,0,0.25)' }}
          >
            Book a Buddy
          </button>
        </div>
        <div className="absolute right-6 top-4 w-24 h-24 rounded-full opacity-20" style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }} />
        <div className="absolute right-10 top-8 w-16 h-16 rounded-full opacity-30" style={{ background: '#2EC4B6' }} />
        <div className="absolute right-14 top-12 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8">

        {/* Activities */}
        <div id="activities" className="py-6">
          <p className="text-center text-sm font-medium mb-5" style={{ color: '#6B7280' }}>
            What do you need a buddy for today?
          </p>
          <div className="grid grid-cols-4 gap-3 md:flex md:justify-center md:gap-6 md:flex-wrap">
  {activities.map((activity) => (
    <button
      key={activity.value}
      onClick={() => handleActivity(activity.value)}
      className="flex flex-col items-center gap-1.5"
    >
      <div
        className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(90deg,  #1F7D97, #2EC4B6)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
      >
        {activity.icon}
      </div>
      <span className="text-[10px] md:text-xs font-medium text-center leading-tight" style={{ color: '#2EC4B6' }}>
        {activity.label}
      </span>
    </button>
  ))}
</div>
        </div>

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>Bookings Coming Up</h3>
              <button onClick={() => navigate('/bookings')} className="text-xs font-medium" style={{ color: '#2EC4B6' }}>
                View All →
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {upcomingBookings.slice(0, 2).map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl p-4"
                  style={{ background: 'white', border: '1px solid #E4E7EC', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #3ABEFF20, #2EC4B620)' }}
                    >
                      <span style={{ color: '#2EC4B6' }}>{booking.companion_name?.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>{booking.location}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{booking.activity}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{booking.companion_name}</p>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: '#2EC4B6' }}>
                        {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} · {booking.time?.slice(0, 5)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/booking/${booking.id}`)}
                    className="w-full py-2.5 rounded-full text-white text-xs font-semibold"
                    style={{ background: 'linear-gradient(90deg,  #1F7D97, #2EC4B6)' }}
                  >
                    View Booking
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Companions */}
        <div id="explore" className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>Recommended Buddies</h3>
            <button onClick={() => navigate('/companions')} className="text-xs font-medium" style={{ color: '#2EC4B6' }}>
              View All →
            </button>
          </div>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: '#E4E7EC' }} />
              ))}
            </div>
          ) : companions.length === 0 ? (
            <p className="text-center text-sm py-6" style={{ color: '#6B7280' }}>No companions found</p>
          ) : (
            <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
              {companions.map((companion) => (
                <CompanionCard
                  key={companion.id}
                  id={companion.id}
                  name={companion.name}
                  specialization={companion.specialization}
                  rating={companion.rating}
                  isVerified={companion.kyc_status === 'verified'}
                  isOnline={companion.is_online}
                />
              ))}
            </div>
          )}
        </div>

        {/* Buddies Near You */}
        {location && location.lat !== 0 && (
          <div className="mb-8 pb-24 md:pb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>Buddies Near You</h3>
              <span className="text-xs" style={{ color: '#6B7280' }}>Within 10km</span>
            </div>
            {nearbyCompanions.length === 0 ? (
              <div
                className="rounded-2xl p-6 flex flex-col items-center gap-2"
                style={{ background: 'white', border: '1px solid #E4E7EC' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#E4E7EC">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                </svg>
                <p className="text-sm" style={{ color: '#6B7280' }}>No buddies found near you</p>
                <p className="text-xs text-center" style={{ color: '#6B7280' }}>
                  Try browsing all companions instead
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
                {nearbyCompanions.map((companion) => (
                  <CompanionCard
                    key={companion.id}
                    id={companion.id}
                    name={companion.name}
                    specialization={companion.specialization}
                    rating={companion.rating}
                    isVerified={companion.kyc_status === 'verified'}
                    isOnline={companion.is_online}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      <Footer />
      <BottomNav />
      {showLocationModal && <LocationModal onLocationSet={handleLocationSet} />}
    </div>
  );
};

export default Home;