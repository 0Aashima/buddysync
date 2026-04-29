import { useState } from 'react';

interface LocationModalProps {
  onLocationSet: (location: string, lat: number, lng: number) => void;
}

const LocationModal = ({ onLocationSet }: LocationModalProps) => {
  const [manual, setManual] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');

  const savedLocation = localStorage.getItem('userLocation')
    ? JSON.parse(localStorage.getItem('userLocation')!)
    : null;

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`
          );
          const data = await res.json();
          const address = data.results[0]?.formatted_address || 'Current Location';
          onLocationSet(address, latitude, longitude);
        } catch {
          onLocationSet('Current Location', latitude, longitude);
        }
        setDetecting(false);
      },
      () => {
        setError('Could not detect location. Please enter manually.');
        setDetecting(false);
      }
    );
  };

  const handleManual = () => {
    if (!manual.trim()) {
      setError('Please enter your location');
      return;
    }
    onLocationSet(manual.trim(), 0, 0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6"
        style={{ background: '#1C2E5A', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">
              {savedLocation ? 'Update Location' : 'Set Your Location'}
            </h3>
            <p className="text-white/50 text-xs">Required for finding nearby companions</p>
          </div>
        </div>

        {/* Current location banner — only shows if location already set */}
        {savedLocation && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
            style={{ background: 'rgba(46,196,182,0.1)', border: '1px solid rgba(46,196,182,0.3)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#2EC4B6">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
            <span className="text-[#2EC4B6] text-xs truncate">
              Current: {savedLocation.label}
            </span>
          </div>
        )}

        {/* Auto detect button */}
        <button
          onClick={detectLocation}
          disabled={detecting}
          className="w-full py-3 rounded-2xl text-white text-sm font-medium mb-4 flex items-center justify-center gap-2"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#2EC4B6">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
          {detecting ? 'Detecting...' : 'Auto-detect my location'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <span className="text-white/30 text-xs">or enter manually</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Manual input */}
        <div
          className="flex items-center gap-2 px-3 py-3 rounded-xl mb-4"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <input
            type="text"
            placeholder="Enter city or area (e.g. Delhi)"
            value={manual}
            onChange={(e) => { setManual(e.target.value); setError(''); }}
            className="bg-transparent text-white placeholder-white/30 text-sm flex-1 outline-none"
          />
        </div>

        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

        {/* Confirm button */}
        <button
          onClick={handleManual}
          className="w-full py-3 rounded-2xl text-white text-sm font-semibold"
          style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}
        >
          {savedLocation ? 'Update Location' : 'Confirm Location'}
        </button>

        {/* Cancel button — only shows if location already set */}
        {savedLocation && (
          <button
            onClick={() => onLocationSet(savedLocation.label, savedLocation.lat, savedLocation.lng)}
            className="w-full py-3 rounded-2xl text-white/50 text-sm mt-2"
          >
            Keep current location
          </button>
        )}
      </div>
    </div>
  );
};

export default LocationModal;