import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OutlineButton from '../components/OutlineButton';

const Splash = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-8 gap-6 "
      style={{ background: 'linear-gradient(135deg, #0F1B3D 0%, #1C2E5A 100%)' }}
    >
      <img src="logo.png" alt="Logo" className="h-36 w-auto object-contain"/>

      {isAuthenticated && user ? (
        <>
          <button
  onClick={() => {
    if (user.role === 'companion') navigate('/companion-home');
    else if (user.role === 'admin') navigate('/admin');
    else navigate('/home');
  }}
  className="w-full max-w-xs py-4 rounded-[10px] font-normal text-white text-base"
  style={{
    background: 'linear-gradient(90deg,  #0037AB, #2EC4B6)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
  }}
>
  Continue as {user.name.split(' ')[0]}
</button>
          <button
            onClick={() => navigate('/login')}
            className="text-white/50 text-sm"
          >
            Login with a different account
          </button>
        </>
      ) : (
        <>
          <OutlineButton label="Log In" onClick={() => navigate('/login')} />
          <button
            onClick={() => navigate('/signup')}
            className="w-full max-w-xs py-4 rounded-[10px] font-normal text-white text-base"
            style={{
              background: 'linear-gradient(90deg,  #0037AB, #2EC4B6)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
            }}
          >
            Sign Up
          </button>
        </>
      )}
    </div>
  );
};

export default Splash;