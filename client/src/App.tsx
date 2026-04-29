import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Companions from './pages/Companions';
import ResetPassword from './pages/ResetPassword';
import CompanionHome from './pages/CompanionHome';
import CompanionProfile from './pages/CompanionProfile';
import ClientProfile from './pages/ClientProfile';
import Profile from './pages/Profile';
import ChatList from './pages/ChatList';
import Chat from './pages/Chat';
import BookSession from './pages/BookSession';
import BookingInfo from './pages/BookingInfo';
import NewBooking from './pages/NewBooking';
import Saved from './pages/Saved';
import OTPEntry from './pages/OTPEntry';
import Payments from './pages/Payments';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setChecking(false), 100);
    return () => clearTimeout(t);
  }, []);

  if (checking) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/companions" element={
            <ProtectedRoute>
              <Companions />
            </ProtectedRoute>
          } />
          <Route path="/companion-home" element={
            <ProtectedRoute>
              <CompanionHome />
            </ProtectedRoute>
          } />
          <Route path="/companions/:id" element={
            <ProtectedRoute>
              <CompanionProfile />
            </ProtectedRoute>
          } />
          <Route path="/client-profile/:id" element={
            <ProtectedRoute>
              <ClientProfile />
            </ProtectedRoute>
          } />
          <Route path="/book/:companionId" element={
            <ProtectedRoute>
              <BookSession />
            </ProtectedRoute>
          } />
          <Route path="/booking/:bookingId" element={
            <ProtectedRoute>
              <BookingInfo />
            </ProtectedRoute>
          } />
          <Route path="/new-booking/:bookingId" element={
            <ProtectedRoute>
              <NewBooking />
            </ProtectedRoute>
          } />
          <Route path="/chats" element={
            <ProtectedRoute>
              <ChatList />
            </ProtectedRoute>
          } />
          <Route path="/chat/:conversationId" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/saved" element={
            <ProtectedRoute>
              <Saved />
            </ProtectedRoute>
          } />
          <Route path="/otp/:bookingId" element={
            <ProtectedRoute>
              <OTPEntry />
            </ProtectedRoute>
          } />
          <Route path="/payments" element={
  <ProtectedRoute>
    <Payments />
  </ProtectedRoute>
} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;