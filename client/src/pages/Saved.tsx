import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CompanionCard from '../components/CompanionCard';
import BottomNav from '../components/BottomNav';

interface Companion {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  kyc_status: string;
  is_online: boolean;
}

const Saved = () => {
  const navigate = useNavigate();
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/api/companions/saved');
        setCompanions(res.data.companions);
      } catch (err) {
        console.error('Failed to fetch saved', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F5F7FA' }}>
      <div
        className="w-full px-4 pt-10 pb-4"
        style={{ background: 'linear-gradient(135deg, #0F1B3D 0%, #1C2E5A 100%)' }}
      >
        <h1 className="text-xl font-bold text-white">Saved Buddies</h1>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: '#E4E7EC' }} />
            ))}
          </div>
        ) : companions.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#E4E7EC">
              <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
            </svg>
            <p className="text-sm font-medium" style={{ color: '#6B7280' }}>No saved buddies yet</p>
            <button
              onClick={() => navigate('/companions')}
              className="px-5 py-2 rounded-full text-white text-xs font-semibold mt-2"
              style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}
            >
              Browse Companions
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {companions.map((c) => (
              <CompanionCard
                key={c.id}
                id={c.id}
                name={c.name}
                specialization={c.specialization}
                rating={c.rating}
                isVerified={c.kyc_status === 'verified'}
                isOnline={c.is_online}
              />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Saved;