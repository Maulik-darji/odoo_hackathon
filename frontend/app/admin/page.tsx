"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const ADMIN_EMAIL = "maulik.darji2005@gmail.com";
  const ADMIN_CODE = "14224";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (email === ADMIN_EMAIL && code === ADMIN_CODE) {
      // Set admin session
      localStorage.setItem("access_token", "admin-hardcoded-token");
      localStorage.setItem("user", JSON.stringify({
        id: 0,
        email: ADMIN_EMAIL,
        name: "Admin",
        role: "Fleet Manager",
        is_admin: true,
        is_approved: true,
      }));
      localStorage.setItem("userRole", "Fleet Manager");
      router.push("/manage-access");
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0f172a",
      fontFamily: "'Inter', sans-serif",
    }}>
      <form onSubmit={handleLogin} style={{
        background: "#1e293b",
        padding: "40px",
        borderRadius: "16px",
        width: "380px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
      }}>
        <h1 style={{ color: "#fff", fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
          Admin Access
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "28px" }}>
          Restricted area. Authorized personnel only.
        </p>

        {error && (
          <div style={{
            background: "#dc2626",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "16px",
          }}>
            {error}
          </div>
        )}

        <label style={{ color: "#cbd5e1", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@email.com"
          required
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "8px",
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#fff",
            fontSize: "15px",
            marginTop: "6px",
            marginBottom: "18px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <label style={{ color: "#cbd5e1", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
          Access Code
        </label>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="•••••"
          required
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: "8px",
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#fff",
            fontSize: "15px",
            marginTop: "6px",
            marginBottom: "28px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <button type="submit" style={{
          width: "100%",
          padding: "13px",
          borderRadius: "10px",
          border: "none",
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          color: "#fff",
          fontSize: "15px",
          fontWeight: 600,
          cursor: "pointer",
        }}>
          Enter
        </button>
      </form>
    </div>
  );
}
