import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function OTPEntry() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpValue = otp.join("");
    if (otpValue.length < 4) {
      setError("Please enter all 4 digits");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/api/otp/verify", {
        bookingId,
        otp: otpValue,
      });
      setSuccess("OTP verified! Session is starting...");
      setTimeout(() => navigate(`/booking/${bookingId}`), 2000);
    } catch (err: any) {
      // Don't logout on error — just show the error message
      const msg = err.response?.data?.message;
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError(msg || "Invalid OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: "24px",
        padding: "40px",
        width: "100%",
        maxWidth: "400px",
        textAlign: "center",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔐</div>
        <h1 style={{ color: "white", fontSize: "24px", marginBottom: "8px" }}>
          Enter Session OTP
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "32px" }}>
          Both you and your buddy must enter the same 4-digit OTP to start the session
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "32px" }}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              style={{
                width: "64px",
                height: "64px",
                textAlign: "center",
                fontSize: "28px",
                fontWeight: "bold",
                borderRadius: "12px",
                border: digit ? "2px solid #06b6d4" : "2px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                outline: "none",
                cursor: "text"
              }}
            />
          ))}
        </div>
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: "8px",
            padding: "12px",
            color: "#fca5a5",
            marginBottom: "16px",
            fontSize: "14px"
          }}>
            ❌ {error}
          </div>
        )}
        {success && (
          <div style={{
            background: "rgba(34,197,94,0.15)",
            border: "1px solid rgba(34,197,94,0.4)",
            borderRadius: "8px",
            padding: "12px",
            color: "#86efac",
            marginBottom: "16px",
            fontSize: "14px"
          }}>
            ✅ {success}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "12px",
            border: "none",
            background: loading ? "#334155" : "linear-gradient(135deg, #06b6d4, #0891b2)",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
        <p
          onClick={() => navigate(`/booking/${bookingId}`)}
          style={{ color: "#64748b", marginTop: "20px", cursor: "pointer", fontSize: "14px" }}
        >
          ← Back to Booking
        </p>
      </div>
    </div>
  );
}