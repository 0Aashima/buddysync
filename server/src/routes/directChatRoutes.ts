import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';
import { Response } from 'express';
import pool from '../config/db';

const router = Router();

router.post('/conversation', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { otherUserId } = req.body;
    const myId = req.user!.id;

    const user1 = myId < otherUserId ? myId : otherUserId;
    const user2 = myId < otherUserId ? otherUserId : myId;

    let conversation = await pool.query(
      `SELECT * FROM conversations WHERE user1_id = $1 AND user2_id = $2`,
      [user1, user2]
    );

    if (conversation.rows.length === 0) {
      conversation = await pool.query(
        `INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2) RETURNING *`,
        [user1, user2]
      );
    }

    res.json({ conversation: conversation.rows[0] });
  } catch (error) {
    console.error('Conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/conversations', protect, async (req: AuthRequest, res: Response) => {
  try {
    const myId = req.user!.id;
    const result = await pool.query(
      `SELECT c.*,
        u1.name as user1_name, u1.specialization as user1_specialization, u1.role as user1_role,
        u2.name as user2_name, u2.specialization as user2_specialization, u2.role as user2_role,
        (SELECT content FROM direct_messages dm
         WHERE (dm.sender_id = c.user1_id AND dm.receiver_id = c.user2_id)
            OR (dm.sender_id = c.user2_id AND dm.receiver_id = c.user1_id)
         ORDER BY dm.created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM direct_messages dm
         WHERE (dm.sender_id = c.user1_id AND dm.receiver_id = c.user2_id)
            OR (dm.sender_id = c.user2_id AND dm.receiver_id = c.user1_id)
         ORDER BY dm.created_at DESC LIMIT 1) as last_message_time
       FROM conversations c
       JOIN users u1 ON c.user1_id = u1.id
       JOIN users u2 ON c.user2_id = u2.id
       WHERE c.user1_id = $1 OR c.user2_id = $1
       ORDER BY last_message_time DESC NULLS LAST`,
      [myId]
    );
    res.json({ conversations: result.rows });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/messages/:conversationId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const conv = await pool.query(
      `SELECT * FROM conversations WHERE id = $1`,
      [conversationId]
    );
    if (conv.rows.length === 0) {
      res.status(404).json({ message: 'Conversation not found' });
      return;
    }
    const c = conv.rows[0];
    const messages = await pool.query(
      `SELECT dm.*, u.name as sender_name
       FROM direct_messages dm
       JOIN users u ON dm.sender_id = u.id
       WHERE (dm.sender_id = $1 AND dm.receiver_id = $2)
          OR (dm.sender_id = $2 AND dm.receiver_id = $1)
       ORDER BY dm.created_at ASC`,
      [c.user1_id, c.user2_id]
    );
    res.json({ messages: messages.rows });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;