import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getAllCompanions, getCompanionById } from '../models/companionModel';

export const listCompanions = async (req: AuthRequest, res: Response) => {
  try {
    const { specialization, minRating, sortByRating, verifiedOnly } = req.query;

    const companions = await getAllCompanions({
  specialization: specialization
    ? Array.isArray(specialization)
      ? (specialization as string[])
      : (specialization as string)
    : undefined,
  minRating: minRating ? parseFloat(minRating as string) : undefined,
  sortByRating: sortByRating === 'true',
  verifiedOnly: verifiedOnly === 'true',
});

    res.json({ companions });
  } catch (error) {
    console.error('List companions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCompanion = async (req: AuthRequest, res: Response) => {
  try {
    const companion = await getCompanionById(req.params.id as string);

    if (!companion) {
      res.status(404).json({ message: 'Companion not found' });
      return;
    }

    res.json({ companion });
  } catch (error) {
    console.error('Get companion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};