import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

interface BookingData {
  id: string;
  client_name: string;
  location: string;
  date: string;
  time: string;
  booking_details: string;
  activity: string;
}

const NewBooking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/api/bookings/${bookingId}`);
        setBooking(res.data.booking);
      } catch (err) {
        console.error('Failed to fetch', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [bookingId]);

  const handleAccept = async () => {
    try {
      setActing(true);
      await api.patch(`/api/bookings/${bookingId}/accept`);
      navigate(`/booking/${bookingId}`);
    } catch (err) {
      console.error('Accept failed', err);
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    try {
      setActing(true);
      await api.patch(`/api/bookings/${bookingId}/reject`);
      navigate(-1);
    } catch (err) {
      console.error('Reject failed', err);
    } finally {
      setActing(false);
    }
  };

  if (loading) return null;
  if (!booking) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0F1B3D 0%, #1C2E5A 100%)' }}>
      <div className="flex justify-end px-4 pt-12">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full rounded-3xl p-6" style={{ background: 'white' }}>
          <h2 className="text-xl font-bold text-center mb-6" style={{ color: '#1A1A1A' }}>New Booking!</h2>

          <div className="flex flex-col gap-2 mb-6 px-2">
            <p className="text-sm" style={{ color: '#1A1A1A' }}>
              <span className="font-semibold">Booking made by:</span> {booking.client_name}
            </p>
            <p className="text-sm" style={{ color: '#1A1A1A' }}>
              <span className="font-semibold">Location:</span> {booking.location}
            </p>
            <p className="text-sm" style={{ color: '#1A1A1A' }}>
              <span className="font-semibold">Date:</span> {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-sm" style={{ color: '#1A1A1A' }}>
              <span className="font-semibold">Time:</span> {booking.time?.slice(0, 5)}
            </p>
            <p className="text-sm" style={{ color: '#1A1A1A' }}>
              <span className="font-semibold">Booking Details:</span> {booking.booking_details || booking.activity}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              disabled={acting}
              className="flex-1 py-3 rounded-full text-white text-sm font-semibold"
              style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}
            >
              Accept Booking
            </button>
            <button
              onClick={handleReject}
              disabled={acting}
              className="flex-1 py-3 rounded-full text-sm font-semibold"
              style={{ border: '1.5px solid #E4E7EC', color: '#1A1A1A', background: 'white' }}
            >
              Reject Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBooking;