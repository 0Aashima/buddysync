import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = ({
  location = 'Delhi, India',
  onLocationClick
}: {
  onSearch?: (query: string) => void;
  location?: string;
  onLocationClick?: () => void;
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      navigate(`/companions?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleSearchClick = () => {
    if (search.trim()) {
      navigate(`/companions?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <>
      {/* Mobile header */}
      <div
  className="md:hidden w-full px-4 pt-10 pb-4"
  style={{ background: '#F5F7FA' }}
>
        <div className="flex items-center justify-between mb-3">
          <img src="logo.png" alt="Logo" className="h-12 w-auto object-contain"/>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: 'linear-gradient(90deg,  #1F7D97, #2EC4B6)' }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </button>
            {showDropdown && (
              <div
  className="absolute right-0 top-11 rounded-xl p-2 z-50 min-w-[140px]"
  style={{ background: 'white', border: '1px solid #E4E7EC', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
>
  <button
    onClick={() => { navigate('/profile'); setShowDropdown(false); }}
    className="w-full text-left px-3 py-2 text-sm rounded-lg"
    style={{ color: '#1A1A1A' }}
  >
    Profile
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

        <div className="flex items-center gap-1 mb-3">
          <button
  onClick={onLocationClick}
  className="flex items-center gap-1 hover:opacity-80 transition-opacity"
>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#1F7D97">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
  <span className="text-xs truncate max-w-[120px]" style={{ color: '#6B7280' }}>{location}</span>
  <svg width="10" height="10" viewBox="0 0 24 24" fill="white" opacity="0.5">
    <path d="M7 10l5 5 5-5z"/>
  </svg>
</button>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-2 rounded-full"
          style={{ background: 'rgb(255, 255, 255)' , boxShadow: '0 2px 8px rgba(0,0,0,0.06)'}}
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
  className="bg-transparent text-xs flex-1 outline-none"
  style={{ color: '#6B7280' }}
/>
          <button onClick={handleSearchClick}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#2EC4B6">
              <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39A.998.998 0 0 0 18.95 4H5.04a1 1 0 0 0-.79 1.61z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop header */}
      <div
        className="hidden md:flex w-full items-center px-8 py-4 gap-6 sticky top-0 z-50"
        style={{ background: '#F5F7FA' }}
      >
        <img src="logo.png" alt="Logo" className="h-12 w-auto object-contain"/>

        <a href="#explore" className="text-white/70 text-sm hover:text-white transition-colors" style={{ color: '#6B7280' }}>Explore</a>
        <a href="#activities" className="text-white/70 text-sm hover:text-white transition-colors" style={{ color: '#6B7280' }}>Activities</a>

        <div className="flex items-center gap-1 ml-2">
          <button
  onClick={onLocationClick}
  className="flex items-center gap-1 hover:opacity-80 transition-opacity"
>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#2EC4B6">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
  <span className="text-xs truncate max-w-[120px]" style={{ color: '#6B7280' }}>{location}</span>
  <svg width="10" height="10" viewBox="0 0 24 24" fill="white" opacity="0.5">
    <path d="M7 10l5 5 5-5z"/>
  </svg>
</button>
        </div>

        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full flex-1 max-w-sm"
          style={{ background: 'rgb(255, 255, 255)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'}}
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
  className="bg-transparent text-xs flex-1 outline-none"
  style={{ color: '#6B7280' }}
/>
        </div>

        <div className="ml-auto relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(90deg,  #1F7D97, #2EC4B6)'  }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </button>
          {showDropdown && (
            <div
  className="absolute right-0 top-11 rounded-xl p-2 z-50 min-w-[140px]"
  style={{ background: 'white', border: '1px solid #E4E7EC', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
>
  <button
    onClick={() => { navigate('/profile'); setShowDropdown(false); }}
    className="w-full text-left px-3 py-2 text-sm rounded-lg"
    style={{ color: '#1A1A1A' }}
  >
    Profile
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
    </>
  );
};

export default Header;