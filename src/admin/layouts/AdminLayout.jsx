import React, { useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

const menu = [
  { label: "لوحة التحكم", path: "/admin" },
  { label: "رفع الطلبات", path: "/admin/upload-orders" },
  { label: "الموظفين", path: "/admin/employees" },
  { label: "المراحل", path: "/admin/stages" },
  { label: "المخزون", path: "/admin/inventory" },
  { label: "الطلبات", path: "/admin/orders" },
  { label: "الموديلات", path: "/admin/upload-models" },
  { label: "طباعة الطلبات", path: "/admin/print-orders" },
  { label: "تقرير المخزون", path: "/admin/stock-repor" },
  { label: "دفعات الموظفين", path: "/admin/add-payment" },
  { label: "تحركات الطلبات", path: "/admin/stages-dashboard" },
  { label: "التقارير", path: "/admin/reports" }
];

export default function AdminLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    let user = {};
    try {
      user = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      user = {};
    }
    // فقط المدير/الأدمـن يدخل هنا
    if (!["admin", "مدير"].includes(user.role)) {
      navigate("/staff");
    }
  }, [navigate]);

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      fontFamily: "'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      direction: "rtl"
    }}>
      {/* القائمة الجانبية */}
      <nav style={{
        width: 280,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: 0,
        boxShadow: "-4px 0 15px rgba(0,0,0,0.1)",
        position: "relative"
      }}>
        {/* Header */}
        <div style={{
          padding: "30px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          textAlign: "center"
        }}>
          <h2 style={{
            color: "#fff",
            margin: 0,
            fontSize: "24px",
            fontWeight: "600",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)"
          }}>
            🏢 لوحة الإدارة
          </h2>
        </div>
        <ul style={{
          listStyle: "none",
          padding: "20px 0",
          margin: 0
        }}>
          {menu.map((item, index) => (
            <li key={item.path} style={{
              margin: "8px 15px",
              borderRadius: "12px",
              overflow: "hidden",
              transition: "all 0.3s ease"
            }}>
              <Link
                to={item.path}
                style={{
                  textDecoration: "none",
                  display: "block",
                  padding: "15px 20px",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: "500",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  textAlign: "right"
                }}
              >
                <span style={{ marginLeft: "10px" }}>
                  {index === 0 && "📊"}
                  {index === 1 && "📤"}
                  {index === 2 && "👥"}
                  {index === 3 && "⚙️"}
                  {index === 4 && "📦"}
                  {index === 5 && "📋"}
                  {index === 6 && "👗"}
                  {index === 7 && "🖨️"}
                  {index === 8 && "📈"}
                  {index === 9 && "💰"}
                  {index === 10 && "🔄"}
                  {index === 11 && "📊"}
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#e74c3c",
            fontSize: 23,
            cursor: "pointer",
            margin: "30px 0 0 0",
            fontWeight: 900
          }}
        >
          <span style={{ fontSize: 30 }}>🚪</span>
          <span style={{ fontSize: 13, marginTop: 4 }}>خروج</span>
        </div>
      </nav>
      {/* محتوى الصفحة */}
      <main style={{
        flex: 1,
        padding: "40px",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
        overflow: "auto"
      }}>
        <div style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "30px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          minHeight: "calc(100vh - 120px)",
          border: "1px solid rgba(255,255,255,0.2)"
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
