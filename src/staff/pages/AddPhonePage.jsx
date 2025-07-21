import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const BASE_URL = process.env.REACT_APP_API_URL;
export default function AddPhonePage() {
  const [digits, setDigits] = useState(""); // آخر 8 أرقام فقط
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const savePhone = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg("");
    // تركيب الرقم النهائي: 9665 + آخر 8 أرقام
    const phone = `9665${digits}`;
    const res = await fetch(`${BASE_URL}/api/employees/${user._id}/phone`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    setLoading(false);
    if (data._id) {
      localStorage.setItem("user", JSON.stringify({ ...user, phone }));
      setMsg("تم حفظ رقم الجوال!");
      setTimeout(() => {
        navigate("/staff");
      }, 800);
    } else {
      setMsg(data.error || "فشل الحفظ");
    }
  };

  // تحقق أن المستخدم يدخل فقط أرقام
  const handleDigits = (e) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 8) v = v.slice(0, 8);
    setDigits(v);
  };

  return (
    <form onSubmit={savePhone} style={{
      maxWidth: 410, margin: "100px auto", background: "#fff", borderRadius: 17,
      boxShadow: "0 3px 18px #eef2f8", padding: "45px 28px"
    }}>
      <h2 style={{
        textAlign: "center", marginBottom: 35, fontWeight: 900, fontSize: 23, letterSpacing: 0.5
      }}>
        إدخال رقم الجوال
      </h2>
      <div style={{ marginBottom: 28 }}>
        <label style={{
          display: "block", marginBottom: 9, fontWeight: 700, color: "#23284d", fontSize: 16
        }}>
          رقم الجوال السعودي
        </label>
        <div style={{
          display: "flex", alignItems: "center", background: "#f5f7fa",
          border: "1.2px solid #c8d0df", borderRadius: 8, padding: "0 13px"
        }}>
          <span style={{
            color: "#2453c8", fontWeight: 900, fontSize: 19, minWidth: 48
          }}>
            05
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{8}"
            placeholder="أدخل آخر 8 أرقام فقط"
            value={digits}
            onChange={handleDigits}
            required
            style={{
              border: "none", background: "none", outline: "none", fontSize: 19,
              fontWeight: 700, padding: "17px 8px", width: "100%", letterSpacing: 2
            }}
            maxLength={8}
          />
        </div>
        <div style={{
          color: "#888", marginTop: 6, fontSize: 14, marginRight: 7
        }}>
          سيُحفظ رقمك بصيغة: <b>9665{digits.padEnd(8, "x")}</b>
        </div>
      </div>
      <button
        style={{
          width: "100%", padding: "15px 0", background: "#0279fc", color: "#fff", fontWeight: 900,
          fontSize: 19, border: "none", borderRadius: 9, marginBottom: 7, letterSpacing: 1.5,
          transition: "background 0.18s"
        }}
        disabled={loading || digits.length !== 8}
      >
        {loading ? "جاري الحفظ..." : "حفظ"}
      </button>
      {msg && (
        <div style={{
          marginTop: 18, color: msg.includes("تم") ? "#27ae60" : "#e74c3c",
          fontWeight: 700, textAlign: "center", fontSize: 17
        }}>
          {msg}
        </div>
      )}
    </form>
  );
}
