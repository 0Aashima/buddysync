import redisClient from '../config/redis';

const OTP_EXPIRY = 600;

export const generateOTP = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const storeOTP = async (bookingId: string, otp: string): Promise<void> => {
  await redisClient.setEx(`otp:${bookingId}`, OTP_EXPIRY, otp);
};

export const verifyOTP = async (bookingId: string, otp: string): Promise<boolean> => {
  const stored = await redisClient.get(`otp:${bookingId}`);
  return stored === otp;
};

export const deleteOTP = async (bookingId: string): Promise<void> => {
  await redisClient.del(`otp:${bookingId}`);
};

export const storeUserVerification = async (
  bookingId: string,
  userId: string
): Promise<void> => {
  await redisClient.setEx(`otp_verified:${bookingId}:${userId}`, OTP_EXPIRY, 'true');
};

export const checkBothVerified = async (
  bookingId: string,
  clientId: string,
  companionId: string
): Promise<boolean> => {
  const clientVerified = await redisClient.get(`otp_verified:${bookingId}:${clientId}`);
  const companionVerified = await redisClient.get(`otp_verified:${bookingId}:${companionId}`);
  return clientVerified === 'true' && companionVerified === 'true';
};