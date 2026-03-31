import { useState } from "react";
import API from "../api";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { useNavigate, Link } from "react-router-dom";

const c = {
  bg: "#0a0e1a", 
  surface: "#0f1526", 
  card: "#141c33",
  border: "#1e2d4d", 
  accentSoft: "#a8c4f0",
  textPrimary: "#ffffff", 
  textMuted: "#7a92b8", 
  textDim: "#3d5070",
};

export default function Signup() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: null as any });

  const roles = [{ label: "Buyer", value: "buyer" }, { label: "Seller", value: "seller" }];
  const handleChange = (e: any, field: string) => setForm({ ...form, [field]: e.target.value });

  const submit = async () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword || !form.role) { alert("All fields are required"); return; }
    if (form.password !== form.confirmPassword) { alert("Passwords do not match"); return; }
    try {
      setLoading(true);
      await API.post("/signup", form);
      alert("Signup successful");
      nav("/");
    } catch (err: any) {
      alert(err.response?.data?.message || "Signup failed");
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
      minHeight: "100vh", 
      background: c.bg, 
      padding: "24px" 
    }}>
      <div style={{ 
        background: c.surface, 
        border: `1px solid ${c.border}`, 
        borderRadius: "16px", 
        padding: "40px 36px", 
        width: "100%", 
        maxWidth: "460px"
      }}>
        <h1 style={{ 
          color: c.textPrimary, 
          fontSize: "28px", 
          fontWeight: 700, 
          margin: "0 0 6px" 
        }}>hello</h1>
        <div style={{ 
          marginBottom: "32px" 
        }}>
          <h2 style={{ 
            color: c.accentSoft, 
            fontSize: "22px", 
            fontWeight: 600, 
            margin: "0 0 6px" 
          }}>Create account</h2>
          <p style={{ 
            color: c.textDim, 
            fontSize: "14px", 
            margin: 0 
          }}>
            Join us today
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {([ ["Full Name","name","text","Full Name"], 
          ["Email","email","text","hello@example.com"], 
          ["Password","password","password","••••••••"], 
          ["Confirm Password","confirmPassword","password","••••••••"] ] as const).map(([label, field, type, placeholder]) => (
            <div key={field} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ color: c.textMuted, fontSize: "13px" }}>{label}</label>
              <InputText type={type} placeholder={placeholder} value={(form as any)[field]} onChange={(e) => handleChange(e, field)} style={inputStyle} />
            </div>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ color: c.textMuted, fontSize: "13px" }}>Role</label>
            <Dropdown value={form.role} options={roles} optionLabel="label" placeholder="Select your role" onChange={(e) => setForm({ ...form, role: e.value })} style={{ ...inputStyle, padding: "8px 14px" }} />
          </div>
          <Button
            label={loading ? "Creating account..." : "Create Account"}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-user-plus"}
            onClick={submit} disabled={loading}
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
            Already have an account?{" "}
            <Link to="/" style={{ color: c.accentSoft, textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}