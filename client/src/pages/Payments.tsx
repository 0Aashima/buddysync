import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Payment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  razorpay_order_id: string;
  booking_id: string;
  activity: string;
  date: string;
  companion_name: string;
}

export default function Payments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/payments/my");
      setPayments(res.data.payments || []);
    } catch (err: any) {
      setError("Could not load transactions.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return { bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.4)", text: "#86efac" };
      case "escrow": return { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.4)", text: "#fde68a" };
      case "pending": return { bg: "rgba(148,163,184,0.15)", border: "rgba(148,163,184,0.4)", text: "#cbd5e1" };
      default: return { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.4)", text: "#fca5a5" };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return "✅";
      case "escrow": return "🔒";
      case "pending": return "⏳";
      default: return "❌";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      padding: "20px"
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", paddingTop: "12px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "white", fontSize: "20px" }}
        >
          ←
        </button>
        <h1 style={{ color: "white", fontSize: "22px", fontWeight: "bold", margin: 0 }}>
          Transaction History
        </h1>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", color: "#94a3b8", marginTop: "60px" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>⏳</div>
          <p>Loading transactions...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.4)",
          borderRadius: "12px",
          padding: "16px",
          color: "#fca5a5",
          textAlign: "center"
        }}>
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && payments.length === 0 && (
        <div style={{ textAlign: "center", color: "#94a3b8", marginTop: "80px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>💳</div>
          <h3 style={{ color: "white", marginBottom: "8px" }}>No transactions yet</h3>
          <p style={{ fontSize: "14px" }}>Your payment history will appear here</p>
          <button
            onClick={() => navigate("/companions")}
            style={{
              marginTop: "24px",
              padding: "12px 24px",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg, #06b6d4, #0891b2)",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Book a Buddy
          </button>
        </div>
      )}

      {/* Transactions List */}
      {!loading && payments.length > 0 && (
        <>
          {/* Summary Card */}
          <div style={{
            background: "rgba(6,182,212,0.1)",
            border: "1px solid rgba(6,182,212,0.3)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between"
          }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 4px 0" }}>Total Spent</p>
              <p style={{ color: "white", fontSize: "20px", fontWeight: "bold", margin: 0 }}>
                ₹{payments.filter(p => p.status === "completed").reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 4px 0" }}>In Escrow</p>
              <p style={{ color: "#fde68a", fontSize: "20px", fontWeight: "bold", margin: 0 }}>
                ₹{payments.filter(p => p.status === "escrow").reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 4px 0" }}>Transactions</p>
              <p style={{ color: "white", fontSize: "20px", fontWeight: "bold", margin: 0 }}>
                {payments.length}
              </p>
            </div>
          </div>

          {/* Payment Cards */}
          {payments.map((payment) => {
            const statusStyle = getStatusColor(payment.status);
            return (
              <div
                key={payment.id}
                onClick={() => navigate(`/booking/${payment.booking_id}`)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  padding: "16px",
                  marginBottom: "12px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "16px" }}>🎯</span>
                    <p style={{ color: "white", fontWeight: "bold", margin: 0, fontSize: "15px" }}>
                      {payment.activity || "Activity Session"}
                    </p>
                  </div>
                  <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0 0 8px 0" }}>
                    with {payment.companion_name || "Companion"} • {payment.date ? formatDate(payment.date) : formatDate(payment.created_at)}
                  </p>
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    background: statusStyle.bg,
                    border: `1px solid ${statusStyle.border}`,
                    borderRadius: "20px",
                    padding: "3px 10px",
                    fontSize: "11px",
                    color: statusStyle.text
                  }}>
                    {getStatusIcon(payment.status)} {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </div>
                </div>
                <div style={{ textAlign: "right", marginLeft: "12px" }}>
                  <p style={{ color: "white", fontWeight: "bold", fontSize: "18px", margin: "0 0 4px 0" }}>
                    ₹{Number(payment.amount).toLocaleString()}
                  </p>
                  <p style={{ color: "#64748b", fontSize: "11px", margin: 0 }}>
                    {formatDate(payment.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}