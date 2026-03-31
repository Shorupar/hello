import { useState } from "react";
import API from "../api";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useNavigate, Link } from "react-router-dom";

const c = {
  bg: "#0a0e1a", 
  surface: "#0f1526", 
  card: "#141c33",
  border: "#1e2d4d", 
  accent: "#ffffff", 
  accentSoft: "#a8c4f0",
  textPrimary: "#ffffff", 
  textMuted: "#7a92b8", 
  textDim: "#3d5070",
};

export default function Login() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: any, field: string) => setForm({ ...form, [field]: e.target.value });

  const login = async () => {
    if (!form.email || !form.password) { alert("All fields required"); return; }
    try {
      setLoading(true);
      const res = await API.post("/login", form);
      localStorage.setItem("token", res.data.token);
      res.data.user.role === "seller" ? nav("/seller") : nav("/buyer");
    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: c.card, border: `1px solid ${c.border}`, borderRadius: "8px",
    color: c.textPrimary, padding: "12px 14px", fontSize: "14px", width: "100%",
  };

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      height: "100vh", 
      background: c.bg 
    }}>
      <div style={{ 
        background: c.surface, 
        border: `1px solid ${c.border}`, 
        borderRadius: "16px", 
        padding: "40px 36px", 
        width: "100%", 
        maxWidth: "420px" 
      }}>
        <h1 style={{ 
          color: c.textPrimary, 
          fontSize: "28px", 
          fontWeight: 700, 
          margin: "0 0 6px" 
        }}>hello</h1>
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ 
            color: c.accentSoft, 
            fontSize: "22px", 
            fontWeight: 600, 
            margin: "0 0 6px" 
          }}>Welcome back</h2>
          <p style={{ 
            color: c.textDim, 
            fontSize: "14px", 
            margin: 0 
          }}>Sign in to your account</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ color: c.textMuted, fontSize: "13px" }}>Email</label>
            <InputText placeholder="hello@example.com" value={form.email} onChange={(e) => handleChange(e, "email")} style={inputStyle} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ color: c.textMuted, fontSize: "13px" }}>Password</label>
            <InputText type="password" placeholder="••••••••" value={form.password} onChange={(e) => handleChange(e, "password")} style={inputStyle} />
          </div>
          <Button
            label={loading ? "Signing in..." : "Sign In"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
            onClick={login} disabled={loading}
            style={{ 
              background: "#ffffff", 
              border: "none", 
              borderRadius: "8px", 
              padding: "13px 20px", 
              fontSize: "15px", 
              fontWeight: 600, 
              color: "#0a0e1a", 
              cursor: "pointer", 
              marginTop: "8px", 
              width: "100%" 
          }}
          />
          <p style={{ textAlign: "center", color: c.textDim, fontSize: "14px", margin: "4px 0 0" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: c.accentSoft, textDecoration: "none", fontWeight: 500 }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}