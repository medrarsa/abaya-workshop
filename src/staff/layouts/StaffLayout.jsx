import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaWallet, FaList, FaCamera, FaChartBar, FaUser, FaSignOutAlt } from "react-icons/fa";

const tabs = [
  { key: "wallet", label: "الرصيد", icon: <FaWallet />, path: "/staff/wallet" },
  { key: "orders", label: "الطلبات", icon: <FaList />, path: "/staff/orders" },
  { key: "scan", label: "جديد", icon: <FaCamera />, path: "/staff/scan" },
  { key: "salary", label: "تقرير", icon: <FaChartBar />, path: "/staff/salary" },
  { key: "profile", label: "حسابي", icon: <FaUser />, path: "/staff/profile" },
];

export default function StaffLayout() {
  const location = useLocation();
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
    if (!user.role) navigate("/login");
    if (["admin", "مدير"].includes(user.role)) navigate("/admin");
  }, [navigate]);

  return (
    <div className="staff-app-ultimate">
      {/* Header - Glassmorphism, Shadow, Blur */}
      <header className="staff-ultimate-header">
        <button
          className="ultimate-logout-btn"
          title="تسجيل الخروج"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
        >
          <FaSignOutAlt />
        </button>
        <h1>لوحة الموظف</h1>
      </header>

      {/* المحتوى */}
      <main className="ultimate-main-content">
        <Outlet />
      </main>

      {/* الفوتر - Glass, Shadow, Animation */}
      <nav className="staff-ultimate-navbar">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path;
          return (
            <div
              key={tab.key}
              className={
                "staff-ultimate-tab" +
                (isActive ? " active" : "") +
                (tab.key === "scan" ? " staff-ultimate-tab-scan" : "")
              }
              onClick={() => navigate(tab.path)}
            >
              {/* الخلفية البيضاوية للأيقونة المحددة */}
              {isActive && tab.key !== "scan" && (
                <span className="tab-icon-bg" />
              )}
              {/* أيقونة الزر */}
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </div>
          );
        })}
      </nav>

      {/* ستايلات فخمة */}
      <style>{`
        .staff-app-ultimate {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #f4f9fd 55%, #e8f3ff 100%);
          font-family: 'Cairo', Tahoma, Arial, sans-serif;
        }
        .staff-ultimate-header {
          position: relative;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(15px) saturate(190%);
          box-shadow: 0 7px 35px 0 #6eb5ff11, 0 2px 0 #e2e8f0;
          border-radius: 0 0 34px 34px;
          z-index: 100;
          overflow: visible;
          margin-bottom: 8px;
          animation: dropFade .45s cubic-bezier(.16,1.1,.24,1.0);
        }
        @keyframes dropFade {
          from { opacity:0; transform:translateY(-32px) scale(.93);}
          to { opacity:1; transform:translateY(0) scale(1);}
        }
        .staff-ultimate-header h1 {
          margin: 0 auto;
          color: #1a2553;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: .4px;
          line-height: 1.05;
          text-shadow: 0 4px 18px #fff6, 0 1px 2px #fff3;
          flex: 1;
          text-align: center;
        }
        .ultimate-logout-btn {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          width: 46px;
          height: 46px;
          background: rgba(255,255,255,0.88);
          border: none;
          border-radius: 50%;
          box-shadow: 0 2px 16px #e74c3c29, 0 1px 1.5px #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e74c3c;
          font-size: 22px;
          transition: box-shadow 0.2s, background 0.18s, color 0.15s, transform 0.13s;
          outline: none;
          z-index: 5;
        }
        .ultimate-logout-btn:hover, .ultimate-logout-btn:focus {
          box-shadow: 0 8px 26px #e74c3c47, 0 1px 2px #eee;
          background: #fff0f0fa;
          color: #b71c1c;
          transform: scale(1.10) rotate(-7deg);
        }

        /* Main Content */
        .ultimate-main-content {
          flex: 1;
          padding: 30px 12px 102px 12px;
          min-height: 220px;
        }

        /* Footer Navbar */
        .staff-ultimate-navbar {
          display: flex;
          justify-content: space-around;
          align-items: center;
          background: rgba(255,255,255,0.86);
          border-top: 2px solid #e4ecfa;
          box-shadow: 0 -4px 34px #246bfd1c, 0 -1.5px 12px #a9d4ff1a;
          position: fixed;
          left: 0; right: 0; bottom: 0;
          z-index: 220;
          height: 76px;
          border-radius: 25px 25px 0 0;
          padding: 0 14px;
          backdrop-filter: blur(13px) saturate(120%);
          animation: fadeInNav .5s cubic-bezier(.2,1,.23,1);
        }
        @keyframes fadeInNav {
          from { opacity:0; transform:translateY(42px);}
          to { opacity:1; transform:translateY(0);}
        }
        .staff-ultimate-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 22px;
          color: #8a9ab9;
          font-weight: 700;
          cursor: pointer;
          transition: color .19s, transform .16s, background .18s;
          padding: 0 7px;
          user-select: none;
          min-width: 56px;
          position: relative;
          border-radius: 17px;
        }
        .tab-icon-bg {
          position: absolute;
          top: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 50px;
          height: 38px;
          background: linear-gradient(135deg,#246bfd16 60%, #e0eaff 100%);
          border-radius: 21px 21px 18px 18px / 22px 22px 17px 17px;
          z-index: 1;
          box-shadow: 0 2px 16px #246bfd14;
          pointer-events: none;
          transition: background 0.18s, width 0.13s;
          opacity: 0.95;
        }
        .tab-icon {
          position: relative;
          z-index: 2;
          font-size: 27px;
          margin-bottom: 2px;
          display: flex;
        }
        .tab-label {
          font-size: 13.2px;
          margin-top: 1.5px;
          font-weight: 800;
          letter-spacing: .1px;
          position: relative;
          z-index: 2;
        }
        .staff-ultimate-tab.active, .staff-ultimate-tab:hover {
          color: #246bfd;
          background: none;
          transform: scale(1.09);
        }
        .staff-ultimate-tab.active:after {
          content: "";
          display: block;
          position: absolute;
          bottom: -11px;
          left: 50%;
          transform: translateX(-50%);
          width: 38%;
          height: 5px;
          background: linear-gradient(90deg,#19ad5b, #246bfd 90%);
          border-radius: 7px;
          opacity: 0.29;
          animation: popNav .42s;
        }
        @keyframes popNav {
          from { width: 0; opacity: 0; }
          to   { width: 38%; opacity: 0.29;}
        }

        /* زر جديد (مميز) */
        .staff-ultimate-tab-scan {
          color: #1b824a;
          background: linear-gradient(110deg, #eafef1 70%, #d4fff4 100%);
          border-radius: 22px;
          font-size: 28px;
          margin-top: -20px;
          box-shadow:
            0 8px 18px 0 #27ae6038,
            0 0 0 6px #19ad5b18,
            0 2px 9px 0 #9fffd822;
          padding: 12px 16px 7px 16px;
          border: 1.5px solid #d1ffec9a;
          position: relative;
          transition: box-shadow 0.19s, background 0.15s, transform 0.14s;
          z-index: 4;
          overflow: visible;
        }
        .staff-ultimate-tab-scan.active,
        .staff-ultimate-tab-scan:active {
          background: linear-gradient(110deg, #c5f3df 70%, #edfff7 100%);
          box-shadow:
            0 13px 28px #19ad5b49,
            0 0 0 10px #19ad5b13;
          transform: scale(1.10);
        }

        @media (max-width: 640px) {
          .staff-ultimate-header { height: 56px; }
          .staff-ultimate-header h1 { font-size: 17.5px; }
          .ultimate-logout-btn { right: 7px; width: 36px; height: 36px; font-size: 17px; }
          .staff-ultimate-navbar { height: 62px; border-radius: 15px 15px 0 0; }
          .ultimate-main-content { padding: 13px 2px 74px 2px; }
          .staff-ultimate-tab { min-width: 44px; font-size: 17px; }
          .tab-icon-bg { width: 38px; height: 30px; }
        }
      `}</style>
    </div>
  );
}
