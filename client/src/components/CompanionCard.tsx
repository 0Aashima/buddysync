import { useNavigate } from 'react-router-dom';

interface CompanionCardProps {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  isVerified?: boolean;
  isOnline?: boolean;
}

const CompanionCard = ({ id, name, specialization, rating, isVerified, isOnline }: CompanionCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:shadow-md transition-shadow"
      style={{
        background: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid #E4E7EC',
      }}
      onClick={() => navigate(`/companions/${id}`)}
    >
      {/* Avatar with online indicator */}
      <div className="relative flex-shrink-0">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #3ABEFF20, #2EC4B620)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#2EC4B6">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </div>
        {isOnline && (
          <div
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
            style={{ background: '#22C55E' }}
          />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>{name}</h3>
          {isVerified && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#2EC4B6">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          )}
        </div>
        <p className="text-xs mt-0.5 truncate" style={{ color: '#6B7280' }}>{specialization}</p>
        <div className="flex items-center gap-1 mt-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: isOnline ? '#22C55E' : '#E4E7EC' }}
          />
          <span className="text-xs" style={{ color: isOnline ? '#22C55E' : '#6B7280' }}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Rating */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(90deg,  #1F7D97, #2EC4B6)' }}
      >
        <span className="text-white text-xs font-bold">{rating}</span>
      </div>
    </div>
  );
};

export default CompanionCard;