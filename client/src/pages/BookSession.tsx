import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const BookSession = () => {
  const { companionId } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [amount, setAmount] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleBookMeet = async () => {
    if (!location || !date || !time) {
      setError('Please fill in location, date and time');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/api/bookings', {
        companion_id: companionId,
        date,
        time,
        location,
        activity: 'Activity',
        booking_details: details,
      });
      setBookingId(res.data.booking.id);
      setShowPayment(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!amount || parseInt(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    try {
      setPaymentLoading(true);
      await api.post('/api/payments/initiate', {
        bookingId,
        amount: parseInt(amount),
      });
      navigate(`/booking/${bookingId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#F5F7FA' }}>
      {/* Companion photo placeholder */}
      <div
        className="w-full h-48 relative flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0F1B3D 0%, #1C2E5A 100%)' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-10 left-4 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-10 right-4 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      {/* Booking form sheet */}
      <div className="rounded-t-3xl -mt-6 relative" style={{ background: 'white', minHeight: '70vh' }}>
        <div className="px-5 pt-6 pb-10">
          <h2 className="text-base font-semibold mb-5" style={{ color: '#1A1A1A' }}>Select location</h2>

          {/* Location search */}
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl mb-3"
            style={{ background: '#F5F7FA', border: '1px solid #E4E7EC' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#6B7280">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm flex-1"
              style={{ color: '#1A1A1A' }}
            />
          </div>

          {/* Map placeholder */}
          <div
            className="w-full h-40 rounded-xl mb-3 flex items-center justify-center"
            style={{ background: '#E4E7EC' }}
          >
            <p className="text-xs" style={{ color: '#6B7280' }}>Map view</p>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px" style={{ background: '#E4E7EC' }} />
            <span className="text-xs" style={{ color: '#6B7280' }}>OR</span>
            <div className="flex-1 h-px" style={{ background: '#E4E7EC' }} />
          </div>

          {/* Manual location */}
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4"
            style={{ border: '1px solid #E4E7EC' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#2EC4B6">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
            <input
              type="text"
              placeholder="Enter location manually"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent outline-none text-sm flex-1"
              style={{ color: '#1A1A1A' }}
            />
          </div>

          {/* Date */}
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4"
            style={{ border: '1.5px solid #2EC4B6' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#2EC4B6">
              <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
            </svg>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent outline-none text-sm flex-1"
              style={{ color: date ? '#1A1A1A' : '#6B7280' }}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Time */}
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4"
            style={{ border: '1px solid #E4E7EC' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#6B7280">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
            </svg>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-transparent outline-none text-sm flex-1"
              style={{ color: time ? '#1A1A1A' : '#6B7280' }}
            />
          </div>

          {/* Booking details */}
          <div
            className="px-4 py-3 rounded-xl mb-6"
            style={{ border: '1px solid #E4E7EC' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#6B7280">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              <span className="text-xs font-medium" style={{ color: '#6B7280' }}>Booking Details</span>
            </div>
            <textarea
              placeholder="Describe your booking here..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="w-full bg-transparent outline-none text-sm resize-none"
              style={{ color: '#1A1A1A' }}
            />
          </div>

          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

          <button
            onClick={handleBookMeet}
            disabled={loading}
            className="w-full py-4 rounded-full text-white font-semibold text-sm"
            style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}
          >
            {loading ? 'Creating booking...' : 'Book Meet'}
          </button>
        </div>
      </div>

      {/* Payment sheet */}
      {showPayment && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="w-full max-w-[430px] rounded-t-3xl p-6 pb-10"
            style={{ background: 'white' }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: '#E4E7EC' }} />
            <h3 className="text-base font-semibold mb-5" style={{ color: '#1A1A1A' }}>Payment</h3>

            <div
              className="px-4 py-3 rounded-xl mb-6"
              style={{ border: '1.5px solid #2EC4B6' }}
            >
              <input
                type="number"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent outline-none text-sm"
                style={{ color: '#1A1A1A' }}
              />
            </div>

            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

            <button
              onClick={handlePayment}
              disabled={paymentLoading}
              className="w-full py-4 rounded-full text-white font-semibold text-sm"
              style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}
            >
              {paymentLoading ? 'Processing...' : 'Make Payment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookSession;