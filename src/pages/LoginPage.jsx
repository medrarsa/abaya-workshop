import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const BASE_URL = process.env.REACT_APP_API_URL;
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    const res = await fetch(`${BASE_URL}/api/employees/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.error) return setErr(data.error);

    // هذا أهم شيء: خزن بيانات المستخدم بشكل واضح وموحد
    localStorage.setItem(
      "user",
      JSON.stringify({
        _id: data.id || data._id,
        username: data.username,
        name: data.name,
        role: data.jobType, // مدير/قصاص/خياط/...
        jobType: data.jobType, // مدير/قصاص/خياط/...
            status: data.status

      })
    );
    localStorage.setItem("token", data.token || "true"); // لو عندك توكن حقيقي من الـ API خزنه، لو ما عندك يكفي string "true"

    // التوجيه حسب الدور
    if (["admin", "مدير"].includes(data.role || data.jobType)) {
      navigate("/admin");
    } else {
      navigate("/staff");
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ width: 320, margin: "80px auto" }}>
      <h2>تسجيل الدخول</h2>
      <input
        placeholder="اسم المستخدم"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required style={{ width: "100%", margin: "8px 0" }}
      />
      <input
        type="password"
        placeholder="كلمة المرور"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required style={{ width: "100%", margin: "8px 0" }}
      />
      <button style={{ width: "100%", padding: 10, margin: "8px 0" }}>
        دخول
      </button>
      {err && <div style={{ color: "red" }}>{err}</div>}
    </form>
  );
}
