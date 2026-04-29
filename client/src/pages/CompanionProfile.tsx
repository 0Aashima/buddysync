import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

interface Review {
  id: string;
  rating: number;
  feedback: string;
  created_at: string;
}

interface Companion {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  kyc_status: string;
  is_online: boolean;
  gender: string;
  age: number;
  height?: string;
  bio?: string;
}

const CompanionProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [saved, setSaved] = useState(false);

const handleStartChat = async () => {
  if (!companion) return;
  try {
    setChatLoading(true);
    const res = await api.post('/api/direct-chat/conversation', {
      otherUserId: companion.id,
    });
    navigate(`/chat/${res.data.conversation.id}`);
  } catch (err) {
    console.error('Failed to start chat', err);
  } finally {
    setChatLoading(false);
  }
};

useEffect(() => {
  const checkSaved = async () => {
    try {
      const res = await api.get('/api/companions/saved');
      const isSaved = res.data.companions.some((c: any) => c.id === id);
      setSaved(isSaved);
    } catch (err) {}
  };
  checkSaved();
}, [id]);

const toggleSave = async () => {
  try {
    if (saved) {
      await api.delete(`/api/companions/save/${companion?.id}`);
    } else {
      await api.post(`/api/companions/save/${companion?.id}`);
    }
    setSaved(!saved);
  } catch (err) {
    console.error('Save toggle failed', err);
  }
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companionRes, reviewsRes] = await Promise.all([
          api.get(`/api/companions/${id}`),
          api.get(`/api/session/reviews/${id}`),
        ]);
        setCompanion(companionRes.data.companion);
        setReviews(reviewsRes.data.reviews);
      } catch (err) {
        console.error('Failed to fetch companion', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F7FA' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#2EC4B6', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!companion) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F7FA' }}>
        <p style={{ color: '#6B7280' }}>Companion not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: '#F5F7FA' }}>

      {/* Cover photo + back button */}
      <div className="relative">
        <div
          className="w-full h-52 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0F1B3D 0%, #1C2E5A 100%)' }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)' }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-10 left-4 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>

        {companion.is_online && (
          <div
            className="absolute bottom-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full"
            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
            <span className="text-xs font-medium" style={{ color: '#22C55E' }}>Online</span>
          </div>
        )}
      </div>

      {/* Profile info */}
<div className="px-4 py-5">
  <div className="flex items-start justify-between mb-2">
    <div>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>{companion.name}</h1>
        {companion.kyc_status === 'verified' && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#2EC4B6">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        )}
      </div>
      <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>{companion.specialization}</p>
    </div>
  </div>

  {/* Bio */}
  {companion.bio && (
    <p className="text-sm leading-relaxed mb-4" style={{ color: '#6B7280' }}>
      {companion.bio}
    </p>
  )}

  {/* Details row */}
  <div className="flex items-center gap-4 mb-4 flex-wrap">
    {companion.age && (
      <div className="flex items-center gap-1">
        <span className="text-xs font-semibold" style={{ color: '#1A1A1A' }}>Age:</span>
        <span className="text-xs" style={{ color: '#6B7280' }}>{companion.age}</span>
      </div>
    )}
    {companion.height && (
      <div className="flex items-center gap-1">
        <span className="text-xs font-semibold" style={{ color: '#1A1A1A' }}>Height:</span>
        <span className="text-xs" style={{ color: '#6B7280' }}>{companion.height}</span>
      </div>
    )}
    {companion.gender && (
      <div className="flex items-center gap-1">
        <span className="text-xs font-semibold" style={{ color: '#1A1A1A' }}>Gender:</span>
        <span className="text-xs capitalize" style={{ color: '#6B7280' }}>{companion.gender}</span>
      </div>
    )}
  </div>

  {/* Rating */}
  <div className="flex items-center gap-2 mb-5">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
    <span className="font-bold text-sm" style={{ color: '#1A1A1A' }}>{companion.rating}</span>
    <span className="text-xs" style={{ color: '#6B7280' }}>
      ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
    </span>
  </div>

  <div className="h-px mb-5" style={{ background: '#E4E7EC' }} />

  {/* Reviews */}
  <h2 className="font-semibold text-base mb-4" style={{ color: '#1A1A1A' }}>Reviews</h2>

  {reviews.length === 0 ? (
    <div
      className="rounded-2xl p-6 flex flex-col items-center gap-2"
      style={{ background: 'white', border: '1px solid #E4E7EC' }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#E4E7EC">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>
      <p className="text-sm" style={{ color: '#6B7280' }}>No reviews yet</p>
    </div>
  ) : (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-2xl p-4"
          style={{ background: 'white', border: '1px solid #E4E7EC' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>Anonymous</p>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                {new Date(review.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}
            >
              <span className="text-white text-xs font-bold">{review.rating}</span>
            </div>
          </div>
          {review.feedback && (
            <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>{review.feedback}</p>
          )}
          <div className="h-px mt-3" style={{ background: '#F5F7FA' }} />
        </div>
      ))}
    </div>
  )}
</div>

      {/* Bottom action buttons — fixed */}
      <div
        className="fixed bottom-0 left-0 right-0 flex justify-center z-50"
      >
        <div
          className="w-full max-w-[430px] flex gap-3 px-4 py-4"
          style={{ background: 'white', borderTop: '1px solid #E4E7EC' }}
        >
          <button
  onClick={() => navigate(`/book/${companion.id}`)}
  className="flex-1 py-3 rounded-full text-white text-sm font-semibold"
  style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}
>
  Schedule Meet
</button>
          <button
  onClick={handleStartChat}
  disabled={chatLoading}
  className="flex-1 py-3 rounded-full text-sm font-semibold"
  style={{
    background: 'transparent',
    border: '1.5px solid #2EC4B6',
    color: '#2EC4B6',
  }}
>
  {chatLoading ? 'Opening...' : 'Start Chat'}
</button>
<button
  onClick={toggleSave}
  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
  style={{ border: '1.5px solid #E4E7EC', background: 'white' }}
>
  <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? '#2EC4B6' : 'none'} stroke="#2EC4B6" strokeWidth="2">
    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
  </svg>
</button>
        </div>
      </div>
    </div>
  );
};

export default CompanionProfile;