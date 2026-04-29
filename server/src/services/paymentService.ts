import Razorpay from 'razorpay';

const getRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID as string,
    key_secret: process.env.RAZORPAY_KEY_SECRET as string,
  });
};

export const createRazorpayOrder = async (amount: number, bookingId: string) => {
  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: 'INR',
    receipt: `bk_${bookingId.substring(0, 8)}`,
    notes: { bookingId },
  });
  return order;
};

export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  const crypto = require('crypto');
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};