import dotenv from 'dotenv';
dotenv.config();
import pool from './config/db';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server, Socket } from 'socket.io';
import './config/db';
import './config/redis';
import authRoutes from './routes/authRoutes';
import companionRoutes from './routes/companionRoutes';
import bookingRoutes from './routes/bookingRoutes';
import chatRoutes from './routes/chatRoutes';
import { saveMessage } from './models/messageModel';
import paymentRoutes from './routes/paymentRoutes';
import otpRoutes from './routes/otpRoutes';
import sosRoutes from './routes/sosRoutes';
import sessionRoutes from './routes/sessionRoutes';
import adminRoutes from './routes/adminRoutes';
import { generalLimiter } from './middleware/rateLimiter';
import kycRoutes from './routes/kycRoutes';
import directChatRoutes from './routes/directChatRoutes';
import jwt from 'jsonwebtoken';

const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  }
});


app.use(express.json());
app.get('/', (req, res) => {
  res.json({ message: 'BuddySync API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/companions', companionRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/session', sessionRoutes);
app.use(generalLimiter);
app.use('/api/admin', adminRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/direct-chat', directChatRoutes);
interface AuthSocket extends Socket {
  user?: { id: string; role: string };
}

io.use((socket: AuthSocket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('No token'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };
    socket.user = decoded;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', async (socket: AuthSocket) => {
  console.log('Socket connected:', socket.user?.id);

  await pool.query(
    `UPDATE users SET is_online = true, last_seen = NOW() WHERE id = $1`,
    [socket.user!.id]
  );
socket.on('join_conversation', (conversationId: string) => {
  socket.join(`conv_${conversationId}`);
});

socket.on('direct_message', async (data: {
  conversationId: string;
  receiverId: string;
  content: string;
}) => {
  try {
    const result = await pool.query(
      `INSERT INTO direct_messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3) RETURNING *`,
      [socket.user!.id, data.receiverId, data.content]
    );
    io.to(`conv_${data.conversationId}`).emit('new_direct_message', result.rows[0]);
  } catch (error) {
    console.error('Direct message error:', error);
  }
});
  socket.on('join_booking', (bookingId: string) => {
    socket.join(bookingId);
    console.log(`User ${socket.user?.id} joined room ${bookingId}`);
  });

  socket.on('send_message', async (data: { bookingId: string; content: string }) => {
    try {
      const message = await saveMessage(data.bookingId, socket.user!.id, data.content);
      io.to(data.bookingId).emit('receive_message', {
        ...message,
        sender_id: socket.user!.id
      });
    } catch (error) {
      console.error('Message save error:', error);
    }
  });

  socket.on('update_location', async (data: {
    bookingId: string;
    latitude: number;
    longitude: number;
  }) => {
    io.to(data.bookingId).emit('location_updated', {
      userId: socket.user!.id,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: new Date(),
    });
  });

  socket.on('trigger_sos', (data: { bookingId: string }) => {
    io.to(data.bookingId).emit('sos_triggered', {
      userId: socket.user!.id,
      bookingId: data.bookingId,
      timestamp: new Date(),
    });
  });

  socket.on('disconnect', async () => {
    await pool.query(
      `UPDATE users SET is_online = false, last_seen = NOW() WHERE id = $1`,
      [socket.user!.id]
    );
    console.log('Socket disconnected:', socket.user?.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});