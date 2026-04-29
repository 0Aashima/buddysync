import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface ConversationInfo {
  id: string;
  user1_id: string;
  user2_id: string;
  user1_name: string;
  user2_name: string;
  user1_specialization: string;
  user2_specialization: string;
  user1_role: string;
  user2_role: string;
}

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<ConversationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showReport, setShowReport] = useState(false);
const [reportReason, setReportReason] = useState('');
const [reported, setReported] = useState(false);

  const otherPerson = conversation
    ? conversation.user1_id === user?.id
      ? { name: conversation.user2_name, specialization: conversation.user2_specialization }
      : { name: conversation.user1_name, specialization: conversation.user1_specialization }
    : null;

  const receiverId = conversation
    ? conversation.user1_id === user?.id
      ? conversation.user2_id
      : conversation.user1_id
    : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [convRes, msgRes] = await Promise.all([
          api.get(`/api/direct-chat/conversations`),
          api.get(`/api/direct-chat/messages/${conversationId}`),
        ]);
        const conv = convRes.data.conversations.find((c: ConversationInfo) => c.id === conversationId);
        setConversation(conv || null);
        setMessages(msgRes.data.messages);
      } catch (err) {
        console.error('Failed to load chat', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [conversationId]);

  useEffect(() => {
    if (!token || !conversationId) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
    });

    socketRef.current = socket;
    socket.emit('join_conversation', conversationId);

    socket.on('new_direct_message', (message: Message) => {
  setMessages((prev) => {
    if (message.sender_id === user?.id) return prev;
    return [...prev, message];
  });
});

    return () => { socket.disconnect(); };
  }, [token, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
  if (!input.trim() || !socketRef.current || !receiverId) return;

  const optimisticMessage: Message = {
    id: crypto.randomUUID(),
    sender_id: user?.id || '',
    receiver_id: receiverId,
    content: input.trim(),
    created_at: new Date().toISOString(),
  };

  setMessages((prev) => [...prev, optimisticMessage]);
  
  socketRef.current.emit('direct_message', {
    conversationId,
    receiverId,
    content: input.trim(),
  });
  
  setInput('');
};

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
const reportReasons = [
  'Inappropriate behavior',
  'Harassment or threats',
  'Spam or scam',
  'Romantic or sexual advances',
  'Fake profile',
  'Other',
];

const handleReport = async () => {
  if (!reportReason) return;
  try {
    await api.post('/api/sos/trigger', {
      bookingId: conversationId,
      latitude: 0,
      longitude: 0,
      type: 'report',
      reason: reportReason,
    });
    setReported(true);
    setTimeout(() => setShowReport(false), 2000);
  } catch (err) {
    console.error('Report failed', err);
  }
};
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F7FA' }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#2EC4B6', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: '#F5F7FA' }}>

      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-10 pb-4 flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #0F1B3D 0%, #1C2E5A 100%)' }}
      >
        <button onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
        </button>

        <div className="flex-1 cursor-pointer" onClick={() => {
  if (!conversation) return;
  const otherId = conversation.user1_id === user?.id
    ? conversation.user2_id
    : conversation.user1_id;
  const otherRole = conversation.user1_id === user?.id
    ? conversation.user2_role
    : conversation.user1_role;
  if (otherRole === 'companion') {
    navigate(`/companions/${otherId}`);
  } else {
    navigate(`/client-profile/${otherId}`);
  }
}}>
  <h2 className="text-white font-semibold text-base">{otherPerson?.name}</h2>
  <p className="text-white/60 text-xs">{otherPerson?.specialization}</p>
</div>

        {/* Pro feature buttons — voice + video */}
        <div className="flex items-center gap-3">
          <button onClick={() => setShowUpgradeModal(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </button>
          <button onClick={() => setShowUpgradeModal(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </button>
          <button onClick={() => setShowReport(true)}>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
    <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z"/>
  </svg>
</button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 opacity-60">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#E4E7EC">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            <p className="text-sm" style={{ color: '#6B7280' }}>Start by saying hi!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[75%] px-4 py-3 text-sm leading-relaxed"
                style={{
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMe ? '#E4E7EC' : '#2EC4B6',
                  color: isMe ? '#1A1A1A' : 'white',
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div
        className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
        style={{ background: 'white', borderTop: '1px solid #E4E7EC' }}
      >
        <div
          className="flex-1 flex items-center px-4 py-2.5 rounded-full"
          style={{ background: '#F5F7FA', border: '1px solid #E4E7EC' }}
        >
          <input
            type="text"
            placeholder="Start by saying hi..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: '#1A1A1A' }}
          />
        </div>

        {input.trim() ? (
          <button
            onClick={sendMessage}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        ) : (
          <button onClick={() => setShowUpgradeModal(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#2EC4B6">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Upgrade modal */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="w-full max-w-[430px] rounded-t-3xl p-6 pb-10"
            style={{ background: 'white' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-6" style={{ background: '#E4E7EC' }} />
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #3ABEFF, #2EC4B6)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-center mb-2" style={{ color: '#1A1A1A' }}>
              Pro Feature
            </h3>
            <p className="text-sm text-center mb-6" style={{ color: '#6B7280' }}>
              Voice messages, voice calls and video calls are available on the Buddy4day Pro plan.
            </p>
            <button
              onClick={() => { setShowUpgradeModal(false); navigate('/upgrade'); }}
              className="w-full py-4 rounded-full text-white font-semibold text-sm mb-3"
              style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}
            >
              Upgrade to Pro
            </button>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full py-3 text-sm font-medium"
              style={{ color: '#6B7280' }}
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
      {showReport && (
  <div
    className="fixed inset-0 z-50 flex items-end justify-center"
    style={{ background: 'rgba(0,0,0,0.5)' }}
    onClick={() => setShowReport(false)}
  >
    <div
      className="w-full max-w-[430px] rounded-t-3xl p-6 pb-10"
      style={{ background: 'white' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: '#E4E7EC' }} />
      <h3 className="text-base font-bold mb-1" style={{ color: '#1A1A1A' }}>Report User</h3>
      <p className="text-xs mb-4" style={{ color: '#6B7280' }}>Why are you reporting this user?</p>

      {reported ? (
        <div className="text-center py-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#22C55E" className="mx-auto mb-3">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <p className="font-semibold" style={{ color: '#1A1A1A' }}>Report submitted</p>
          <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Our team will review this shortly</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 mb-5">
            {reportReasons.map((reason) => (
              <button
                key={reason}
                onClick={() => setReportReason(reason)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm"
                style={{
                  background: reportReason === reason ? 'rgba(239,68,68,0.08)' : '#F5F7FA',
                  border: reportReason === reason ? '1.5px solid #EF4444' : '1.5px solid transparent',
                  color: reportReason === reason ? '#EF4444' : '#1A1A1A',
                }}
              >
                {reason}
              </button>
            ))}
          </div>
          <button
            onClick={handleReport}
            disabled={!reportReason}
            className="w-full py-4 rounded-full text-white font-semibold text-sm"
            style={{ background: reportReason ? '#EF4444' : '#E4E7EC' }}
          >
            Submit Report
          </button>
        </>
      )}
    </div>
  </div>
)}
    </div>
  );
};

export default Chat;