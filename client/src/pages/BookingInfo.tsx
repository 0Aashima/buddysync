import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';

interface BookingData {
  id: string;
  client_id: string;
  companion_id: string;
  client_name: string;
  companion_name: string;
  location: string;
  activity: string;
  booking_details: string;
  date: string;
  time: string;
  status: string;
}

const BookingInfo = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const [, setSessionStarted] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cancelReasons = [
    'Change of plans', 'Found another companion',
    'Emergency came up', 'Companion not responding',
    'Incorrect booking details', 'Other'
  ];

  const isCompanion = user?.id === booking?.companion_id;
  const otherPersonName = isCompanion ? booking?.client_name : booking?.companion_name;
  const otherId = isCompanion ? booking?.client_id : booking?.companion_id;

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    if (!token || !bookingId) return;
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
    });
    socketRef.current = socket;
    socket.emit('join_booking', bookingId);
    return () => { socket.disconnect(); };
  }, [token, bookingId]);

  useEffect(() => {
    if (booking?.status === 'active') {
      setSessionStarted(true);
      timerRef.current = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [booking?.status]);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/api/bookings/${bookingId}`);
      setBooking(res.data.booking);
      if (res.data.booking.status === 'active') setSessionStarted(true);
    } catch (err) {
      console.error('Failed to fetch booking', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleStartSession = async () => {
    try {
      await api.post('/api/otp/request', { bookingId });
      navigate(`/otp/${bookingId}`);
    } catch (err) {
      console.error('Failed to start session', err);
    }
  };

  const handleEndSession = async () => {
    try {
      await api.post('/api/session/complete', { bookingId });
      if (timerRef.current) clearInterval(timerRef.current);
      await fetchBooking();
    } catch (err) {
      console.error('Failed to end session', err);
    }
  };

  const handleSOS = async () => {
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await api.post('/api/sos/trigger', {
          bookingId,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        alert('SOS alert sent to admin!');
      });
    } catch (err) {
      console.error('SOS failed', err);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason) return;
    try {
      await api.patch(`/api/bookings/${bookingId}/cancel`, { reason: cancelReason });
      setCancelModal(false);
      navigate(-1);
    } catch (err) {
      console.error('Cancel failed', err);
    }
  };

  const handleSubmitReview = async () => {
    if (!rating) return;
    try {
      setSubmittingReview(true);
      await api.post('/api/session/review', {
        bookingId,
        rating,
        punctuality: rating,
        professionalism: rating,
        skill_accuracy: rating,
        feedback: review,
      });
      setShowRating(false);
      navigate(-1);
    } catch (err) {
      console.error('Review failed', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F7FA' }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#2EC4B6', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="min-h-screen pb-10" style={{ background: '#F5F7FA' }}>
      {/* Back button */}
      <div className="px-4 pt-10 pb-4">
        <button onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A1A1A">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
      </div>

      {/* Avatar/photo area */}
      <div
        className="mx-4 rounded-2xl h-48 flex items-center justify-center mb-4"
        style={{ background: '#E4E7EC' }}
      >
        <span className="text-5xl font-bold" style={{ color: '#6B7280' }}>
          {otherPersonName?.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Booking details */}
      <div className="px-4">
        <h2 className="text-xl font-bold mb-1" style={{ color: '#1A1A1A' }}>{booking.location}</h2>
        <p className="text-sm mb-2" style={{ color: '#6B7280' }}>{booking.booking_details || booking.activity}</p>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium" style={{ color: '#1A1A1A' }}>
            {isCompanion ? 'Client:' : 'Buddy:'}
          </span>
          <span className="text-sm" style={{ color: '#6B7280' }}>{otherPersonName}</span>
        </div>

        <button
          onClick={() => {
            if (isCompanion) navigate(`/client-profile/${otherId}`);
            else navigate(`/companions/${otherId}`);
          }}
          className="px-4 py-1.5 rounded-full text-white text-xs font-medium mb-3"
          style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}
        >
          View User
        </button>

        <p className="text-sm mb-0.5" style={{ color: '#1A1A1A' }}>
          <span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p className="text-sm mb-4" style={{ color: '#1A1A1A' }}>
          <span className="font-medium">Time:</span> {booking.time?.slice(0, 5)}
        </p>

        <div className="h-px mb-5" style={{ background: '#E4E7EC' }} />

        {/* Session timer */}
        {booking.status === 'active' && (
          <div className="text-center mb-4">
            <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>SESSION HAS BEGUN</p>
            <p className="text-2xl font-bold font-mono" style={{ color: '#2EC4B6' }}>
              {formatTime(sessionTime)}
            </p>

            {/* Live map placeholder */}
            <div
              className="w-full h-32 rounded-xl mt-3 mb-4 flex items-center justify-center"
              style={{ background: '#E4E7EC' }}
            >
              <p className="text-xs" style={{ color: '#6B7280' }}>Live location</p>
            </div>
          </div>
        )}

        {booking.status === 'completed' && (
          <div className="text-center mb-6">
            <p className="text-xs font-medium" style={{ color: '#6B7280' }}>SESSION HAS ENDED</p>
            <p className="text-xl font-bold" style={{ color: '#2EC4B6' }}>
              {formatTime(sessionTime)}
            </p>
          </div>
        )}

        {/* Action buttons */}
        {booking.status === 'confirmed' && (
          <div className="flex gap-3">
            <button
              onClick={handleStartSession}
              className="flex-1 py-3 rounded-full text-white text-sm font-semibold"
              style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}
            >
              Start Session
            </button>
            <button
              onClick={() => setCancelModal(true)}
              className="flex-1 py-3 rounded-full text-sm font-semibold"
              style={{ border: '1.5px solid #E4E7EC', color: '#1A1A1A', background: 'white' }}
            >
              Cancel Booking
            </button>
          </div>
        )}

        {booking.status === 'active' && (
          <div className="flex gap-3">
            <button
              onClick={handleEndSession}
              className="flex-1 py-3 rounded-full text-sm font-semibold"
              style={{ border: '1.5px solid #E4E7EC', color: '#1A1A1A', background: 'white' }}
            >
              End Session
            </button>
            <button
              onClick={handleSOS}
              className="flex-1 py-3 rounded-full text-white text-sm font-semibold"
              style={{ background: '#EF4444' }}
            >
              SOS{'\n'}(Send Alert)
            </button>
          </div>
        )}

        {booking.status === 'completed' && (
          <button
            onClick={() => setShowRating(true)}
            className="w-full py-3 rounded-full text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}
          >
            Rate User
          </button>
        )}
      </div>

      {/* Cancel modal */}
      {cancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setCancelModal(false)}
        >
          <div
            className="w-full max-w-[430px] rounded-t-3xl p-6 pb-10"
            style={{ background: 'white' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: '#E4E7EC' }} />
            <h3 className="text-base font-bold mb-1" style={{ color: '#1A1A1A' }}>Cancel Booking</h3>
            <p className="text-xs mb-4" style={{ color: '#6B7280' }}>Please select a reason</p>
            <div className="flex flex-col gap-2 mb-6">
              {cancelReasons.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setCancelReason(reason)}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium"
                  style={{
                    background: cancelReason === reason ? 'rgba(46,196,182,0.1)' : '#F5F7FA',
                    border: cancelReason === reason ? '1.5px solid #2EC4B6' : '1.5px solid transparent',
                    color: cancelReason === reason ? '#2EC4B6' : '#1A1A1A',
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              onClick={handleCancel}
              disabled={!cancelReason}
              className="w-full py-4 rounded-full text-white font-semibold text-sm"
              style={{ background: cancelReason ? '#EF4444' : '#E4E7EC' }}
            >
              Confirm Cancellation
            </button>
          </div>
        </div>
      )}

      {/* Rate & Review sheet */}
      {showRating && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="w-full max-w-[430px] rounded-t-3xl p-6 pb-10"
            style={{ background: 'white' }}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-base font-semibold" style={{ color: '#1A1A1A' }}>Rate</span>
              <button onClick={() => setShowRating(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#6B7280">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>

            {/* Star rating */}
            <div className="flex justify-center gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill={star <= rating ? '#F59E0B' : '#E4E7EC'}>
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                </button>
              ))}
            </div>

            {/* Review input */}
            <div
              className="rounded-xl p-4 mb-6"
              style={{ background: '#F5F7FA', border: '1px solid #E4E7EC' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#6B7280">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Leave a Review</span>
              </div>
              <textarea
                placeholder="Describe your experience here..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={3}
                className="w-full bg-transparent outline-none text-sm resize-none"
                style={{ color: '#1A1A1A' }}
              />
            </div>

            <button
              onClick={handleSubmitReview}
              disabled={!rating || submittingReview}
              className="w-full py-4 rounded-full text-white font-semibold text-sm"
              style={{ background: rating ? 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' : '#E4E7EC' }}
            >
              {submittingReview ? 'Posting...' : 'Post Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingInfo;