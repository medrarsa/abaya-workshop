import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const BASE_URL = process.env.REACT_APP_API_URL;

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [lock, setLock] = useState(false);
  const [count, setCount] = useState(50);
  const [loading, setLoading] = useState(false);
  const timer = useRef();
  const navigate = useNavigate();

  // عداد الحماية
  useEffect(() => {
    if (lock) return;
    timer.current = setInterval(() => {
      setCount((c) => {
        if (c === 1) {
          setLock(true);
          clearInterval(timer.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer.current);
  }, [lock]);

  // بوب اب الخطأ
  useEffect(() => {
    if (err) {
      toast.error(err, {
        position: "top-center",
        autoClose: 5000,
        style: {
          fontWeight: 900,
          fontSize: 17,
          color: "#fff",
          background: "#eb252fff", // أزرق ملكي
          boxShadow: "0 6px 44px #2563eb44"
        }
      });
    }
  }, [err]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/employees/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.error) {
        setErr(data.error);
        setLoading(false);
        return;
      }
      localStorage.setItem(
        "user",
        JSON.stringify({
          _id: data.id || data._id,
          username: data.username,
          name: data.name,
          role: data.jobType,
          jobType: data.jobType,
          status: data.status,
        })
      );
      localStorage.setItem("token", data.token || "true");
      if (["admin", "مدير"].includes(data.role || data.jobType)) {
        navigate("/admin");
      } else {
        navigate("/staff");
      }
    } catch (e) {
      setErr("خطأ في الاتصال بالسيرفر!");
      setLoading(false);
    }
  };

  // لو الصفحة مجمدة
  if (lock) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div style={{
          fontWeight: 900,
          fontSize: 32,
          color: "#2563eb",
          marginBottom: 20,
          letterSpacing: 2
        }}>
          🔒 حماية النظام
        </div>
        <div style={{
          color: "#1e1e1e",
          fontSize: 21,
          fontWeight: 600,
          marginBottom: 20,
        }}>
          تم تجميد الصفحة بسبب عدم وجود أي تفاعل<br />
          جرب إعادة تحميل الصفحة لتسجيل الدخول من جديد.
        </div>
        <div style={{
          color: "#2563eb",
          fontSize: 20,
          fontWeight: 700,
          background: "#f3f3f3",
          padding: "10px 34px",
          borderRadius: 11,
          boxShadow: "0 2px 16px #2563eb11"
        }}>
          يمكنك المحاولة بعد: <span style={{ color: "#60a5fa", fontSize: 24 }}>{count}</span> ثانية
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* خطوط ودائرة كديكور */}
      <svg
        viewBox="0 0 600 120"
        width="100%"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          zIndex: 0,
          opacity: 0.7,
        }}
      >
        <circle cx="30" cy="60" r="17" fill="#60a5fa" />
        <circle cx="550" cy="110" r="13" fill="#2563eb" />
        <circle cx="110" cy="110" r="8" fill="#60a5fa" />
        <circle cx="540" cy="70" r="6" fill="#2563eb" />
        <circle cx="120" cy="40" r="4" fill="#60a5fa" />
        <circle cx="510" cy="10" r="8" fill="#2563eb" />
        <path
          d="M 0 100 Q 300 0 600 100"
          stroke="#60a5fa"
          strokeWidth="5"
          fill="none"
        />
      </svg>

      <form
        onSubmit={handleLogin}
        style={{
          width: "100%",
          maxWidth: 340,
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 8px 44px 0 #60a5fa1a",
          padding: "36px 18px 20px 18px",
          margin: "32px auto",
          zIndex: 2,
          position: "relative"
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: 24,
            color: "#171717",
            fontWeight: 800,
            fontSize: 26,
            letterSpacing: 0.5,
          }}
        >
          تسجيل دخول
        </h2>
        <label style={{ color: "#171717", fontWeight: 600, fontSize: 15 }}>
          اسم مستخدم *
        </label>
        <input
          placeholder="Enter your Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          disabled={lock || loading}
          style={{
            width: "90%",
            margin: "8px 0 14px 0",
            padding: "12px 11px",
            border: "1.3px solid #eee",
            borderRadius: 6,
            fontSize: 16,
            background: "#f3f4f6",
            color: "#1e1e1e",
            fontWeight: 500,
            letterSpacing: 0.5,
            outline: "none",
          }}
        />
        <label style={{ color: "#171717", fontWeight: 600, fontSize: 15 }}>
          كلمة مرور *
        </label>
        <input
          type="password"
          placeholder="Enter your Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={lock || loading}
          style={{
            width: "90%",
            margin: "8px 0 8px 0",
            padding: "12px 11px",
            border: "1.3px solid #eee",
            borderRadius: 6,
            fontSize: 16,
            background: "#f3f4f6",
            color: "#1e1e1e",
            fontWeight: 500,
            letterSpacing: 1,
            outline: "none",
          }}
        />
        <button
          style={{
            width: "100%",
            padding: "12px",
            background: "#2563eb",
            color: "#fff",
            fontWeight: 900,
            border: "none",
            borderRadius: 4,
            fontSize: 17,
            letterSpacing: 0.5,
            marginBottom: 10,
            marginTop: 8,
            boxShadow: "0 4px 18px #2563eb22",
            cursor: lock || loading ? "not-allowed" : "pointer",
            opacity: lock || loading ? 0.7 : 1,
            transition: "background 0.15s"
          }}
          disabled={lock || loading}
        >
          {loading ? (
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              <span
                className="loader"
                style={{
                  width: 18,
                  height: 18,
                  border: "3px solid #fff",
                  borderTop: "3px solid #60a5fa",
                  borderRadius: "50%",
                  display: "inline-block",
                  marginRight: 10,
                  animation: "spin 0.9s linear infinite"
                }}
              ></span>
              جاري التحقق...
            </span>
          ) : (
            "Login"
          )}
        </button>
        <ToastContainer />
      </form>
      {/* عداد الحماية السفلي */}
      <div style={{
        position: "fixed",
        bottom: 12,
        left: 0,
        width: "100vw",
        textAlign: "center",
        fontWeight: 700,
        fontSize: 17,
        color: "#60a5fa",
        zIndex: 5,
        letterSpacing: 1,
        userSelect: "none"
      }}>
        {count > 0 &&
          <span>سيتم تجميد الصفحة خلال <span style={{
            color: "#2563eb",
            fontSize: 22,
            margin: "0 2px",
            fontWeight: 900
          }}>{count}</span> ثانية</span>
        }
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );
}
