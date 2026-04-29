import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CompanionCard from '../components/CompanionCard';
import api from '../services/api';

interface Companion {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  kyc_status: string;
  is_online: boolean;
}

const specializations = [
  'Food & Dining', 'Travel & Tours', 'Fashion & Shopping',
  'Events & Activities', 'Photography', 'Art & Painting'
];

const Companions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(
    searchParams.get('specialization') ? [searchParams.get('specialization')!] : []
  );
  const [sortByRating, setSortByRating] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  

  const fetchCompanions = async () => {
  try {
    setLoading(true);
    const params = new URLSearchParams();
    if (sortByRating) params.append('sortByRating', 'true');
    if (verifiedOnly) params.append('verifiedOnly', 'true');
    if (search.trim()) params.append('specialization', search.trim());
    selectedSpecs.forEach(s => params.append('specialization', s));
    const res = await api.get(`/api/companions?${params.toString()}`);
    setCompanions(res.data.companions);
  } catch (err) {
    console.error('Failed to fetch companions', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  fetchCompanions();
}, [sortByRating, verifiedOnly, selectedSpecs, search]);

  const toggleSpec = (spec: string) => {
    setSelectedSpecs(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') fetchCompanions();
  };

  return (
    <div className="min-h-screen" style={{ background: '#F5F7FA' }}>

      {/* Header */}
      <div
        className="w-full px-4 pt-10 pb-4 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, #0F1B3D 0%, #1C2E5A 100%)' }}
      >
        <button onClick={() => navigate('/home')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>

        <div
          className="flex items-center gap-2 px-3 py-2 rounded-full flex-1"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#6B7280">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="Find a stylist, photographer, guide..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="bg-transparent text-white placeholder-white/40 text-xs flex-1 outline-none"
          />
        </div>
<button
  onClick={() => setSortByRating(!sortByRating)}
  className="w-8 h-8 rounded-full flex items-center justify-center"
  style={{ background: sortByRating ? '#2EC4B6' : 'rgba(255,255,255,0.1)' }}
>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
    <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
  </svg>
</button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: showFilters ? '#2EC4B6' : 'rgba(255,255,255,0.1)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39A.998.998 0 0 0 18.95 4H5.04a1 1 0 0 0-.79 1.61z"/>
          </svg>
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="w-full px-4 py-4" style={{ background: 'white', borderBottom: '1px solid #E4E7EC' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>Filters</span>
            <button
              onClick={() => { setSelectedSpecs([]); setSortByRating(false); setVerifiedOnly(false); }}
              className="text-xs"
              style={{ color: '#2EC4B6' }}
            >
              Clear all
            </button>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Sort by highest rating</span>
            <button
              onClick={() => setSortByRating(!sortByRating)}
              className="w-10 h-5 rounded-full transition-colors relative"
              style={{ background: sortByRating ? '#2EC4B6' : '#E4E7EC' }}
            >
              <div
                className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform"
                style={{ transform: sortByRating ? 'translateX(22px)' : 'translateX(2px)' }}
              />
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Verified companions only</span>
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className="w-10 h-5 rounded-full transition-colors relative"
              style={{ background: verifiedOnly ? '#2EC4B6' : '#E4E7EC' }}
            >
              <div
                className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform"
                style={{ transform: verifiedOnly ? 'translateX(22px)' : 'translateX(2px)' }}
              />
            </button>
          </div>

          <p className="text-xs font-medium mb-2" style={{ color: '#6B7280' }}>Specialization</p>
          <div className="flex flex-wrap gap-2">
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => toggleSpec(spec)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                style={{
                  background: selectedSpecs.includes(spec) ? 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' : '#F5F7FA',
                  color: selectedSpecs.includes(spec) ? 'white' : '#6B7280',
                  border: selectedSpecs.includes(spec) ? 'none' : '1px solid #E4E7EC',
                }}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-4 pb-24 md:pb-8">
        <p className="text-xs mb-3" style={{ color: '#6B7280' }}>
          {loading ? 'Finding companions...' : `${companions.length} companion${companions.length !== 1 ? 's' : ''} found`}
        </p>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: '#E4E7EC' }} />
            ))}
          </div>
        ) : companions.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#E4E7EC">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
            <p className="text-sm" style={{ color: '#6B7280' }}>No companions found</p>
            <button
              onClick={() => { setSelectedSpecs([]); setSortByRating(false); setVerifiedOnly(false); setSearch(''); }}
              className="text-xs font-medium"
              style={{ color: '#2EC4B6' }}
            >
              Clear filters
            </button>
          </div>
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
    </div>
  );
};

export default Companions;