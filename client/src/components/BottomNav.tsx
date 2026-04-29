import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const homePath = user?.role === 'companion' ? '/companion-home' : '/home';

  const items = [
    { label: 'Home', path: homePath, icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    )},
    { label: 'Chats', path: '/chats', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    )},
    { label: 'Saved', path: '/saved', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
      </svg>
    )},
    { label: 'Profile', path: '/profile', icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
      </svg>
    )},
  ];

  const isActive = (path: string) => {
    if (path === homePath) {
      return location.pathname === '/home' || location.pathname === '/companion-home';
    }
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-[10px] left-0 right-0 flex justify-center md:hidden z-50">
      <div
        className="w-full rounded-[20px] max-w-[430px] flex justify-around items-center py-3 px-4"
        style={{
          background: 'white',
          borderTop: '1px solid #E4E7EC',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
        }}
      >
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-1"
            style={{ color: isActive(item.path) ? '#2EC4B6' : '#6B7280' }}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;