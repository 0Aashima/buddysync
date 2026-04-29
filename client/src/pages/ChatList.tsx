import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import BottomNav from '../components/BottomNav';

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  user1_name: string;
  user2_name: string;
  user1_specialization: string;
  user2_specialization: string;
  last_message: string;
  last_message_time: string;
}

const ChatList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/api/direct-chat/conversations');
        setConversations(res.data.conversations);
      } catch (err) {
        console.error('Failed to fetch conversations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const getOtherPerson = (conv: Conversation) => {
    const isUser1 = conv.user1_id === user?.id;
    return {
      name: isUser1 ? conv.user2_name : conv.user1_name,
      specialization: isUser1 ? conv.user2_specialization : conv.user1_specialization,
    };
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: '#F5F7FA' }}>
      <div
        className="w-full px-4 pt-10 pb-4"
        style={{ background: 'linear-gradient(135deg, #0F1B3D 0%, #1C2E5A 100%)' }}
      >
        <h1 className="text-xl font-bold text-white">Chats</h1>
      </div>

      <div className="px-4 py-3">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: '#E4E7EC' }} />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#E4E7EC">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            <p className="text-sm font-medium" style={{ color: '#6B7280' }}>No chats yet</p>
            <p className="text-xs text-center" style={{ color: '#6B7280' }}>
              Browse companions and start a conversation
            </p>
            <button
              onClick={() => navigate('/companions')}
              className="px-5 py-2 rounded-full text-white text-xs font-semibold mt-2"
              style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}
            >
              Browse Companions
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {conversations.map((conv) => {
              const other = getOtherPerson(conv);
              return (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/chat/${conv.id}`)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl text-left"
                  style={{ background: 'white', border: '1px solid #E4E7EC', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
                    style={{ background: 'linear-gradient(90deg, #3ABEFF, #2EC4B6)' }}
                  >
                    {other.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-semibold text-sm truncate" style={{ color: '#1A1A1A' }}>
                        {other.name}
                      </p>
                      {conv.last_message_time && (
                        <p className="text-xs flex-shrink-0 ml-2" style={{ color: '#6B7280' }}>
                          {new Date(conv.last_message_time).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short'
                          })}
                        </p>
                      )}
                    </div>
                    <p className="text-xs truncate" style={{ color: '#6B7280' }}>
                      {other.specialization || 'Companion'}
                    </p>
                    {conv.last_message && (
                      <p className="text-xs truncate mt-0.5" style={{ color: '#6B7280' }}>
                        {conv.last_message}
                      </p>
                    )}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#E4E7EC">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default ChatList;