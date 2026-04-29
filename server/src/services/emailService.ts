import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendBookingConfirmation = async (
  clientEmail: string,
  clientName: string,
  companionEmail: string,
  companionName: string,
  booking: {
    id: string;
    date: string;
    time: string;
    location: string;
    activity: string;
  }
) => {
  const details = `
    Activity: ${booking.activity}
    Date: ${booking.date}
    Time: ${booking.time}
    Location: ${booking.location}
    Booking ID: ${booking.id}
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: clientEmail,
    subject: 'BuddySync — Booking Confirmed!',
    text: `Hi ${clientName},\n\nYour booking with ${companionName} has been confirmed!\n\n${details}\n\nSee you there!\nTeam BuddySync`,
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: companionEmail,
    subject: 'BuddySync — New Booking Request',
    text: `Hi ${companionName},\n\nYou have a new booking from ${clientName}!\n\n${details}\n\nPlease be on time!\nTeam BuddySync`,
  });
};