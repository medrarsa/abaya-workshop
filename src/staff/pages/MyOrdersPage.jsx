import React, { useEffect, useState } from "react";
import { FaClipboardList, FaClock, FaCheckCircle, FaArrowLeft } from "react-icons/fa";
const BASE_URL = process.env.REACT_APP_API_URL;

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // متغير التحميل
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const jobType = user.jobType;

  useEffect(() => {
    if (!jobType) return;
    setLoading(true); // إظهار شاشة التحميل أول ما تبدأ
    fetch(`${BASE_URL}/api/stage-orders/for-stage/${encodeURIComponent(jobType)}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data || []);
        setLoading(false); // إخفاء شاشة التحميل بعد جلب البيانات
      }).catch(() => setLoading(false));
  }, [jobType]);

  return (
    <div className="orders-timeline-bg">
      {/* شاشة جاري التحميل */}
      {loading && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(255,255,255,0.8)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          fontSize: 27,
          fontWeight: 900,
          color: "#2563eb",
          letterSpacing: 1,
          fontFamily: "Tajawal, Arial"
        }}>
          <div style={{
            width: 54, height: 54, border: "6px solid #dbeafe",
            borderTop: "6px solid #2563eb", borderRadius: "50%",
            marginBottom: 18, animation: "spin 1.2s linear infinite"
          }} />
          جاري تحميل الصفحة...
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg);}
              100% { transform: rotate(360deg);}
            }
          `}</style>
        </div>
      )}

      <div className="orders-timeline-header">
        <FaClipboardList className="orders-timeline-icon" />
        <span>طلبات جديدة <span className="jobtype">{jobType || "موظف"}</span></span>
      </div>
      <div className="orders-timeline-list">
        {orders.length === 0 && !loading ? (
          <div className="orders-timeline-empty">لا توجد طلبات حالياً لهذه المرحلة.</div>
        ) : (
          orders.map((order, idx) => (
            <div className="timeline-item" key={order._id}>
              <div className="timeline-dot">
                {getStatusIcon(order.priority)}
              </div>
              <div className="timeline-content">
                <div className="timeline-row">
                  <span className="timeline-label">رقم الطلب</span>
                  <span className="timeline-num">{order.orderNumber || order._id}</span>
                </div>
                <div className="timeline-row">
                  <span className="timeline-label">المقاس</span>
                  <span>{order.size || "-"}</span>
                </div>
                <div className="timeline-row">
                  <span className="timeline-label">نوع القماش</span>
                  <span>{order.fabric || "-"}</span>
                </div>
                <div className="timeline-row">
                  <span className="timeline-label">الأولوية</span>
                  <span className={`timeline-badge ${badgeColor(order.priority)}`}>
                    {badgePriority(order.priority)}
                  </span>
                </div>
              </div>
              {idx !== orders.length - 1 && <div className="timeline-line"></div>}
            </div>
          ))
        )}
      </div>
      <style>{`
        .orders-timeline-bg {
          min-height: 94vh;
          width: 100vw;
          background: linear-gradient(111deg, #f8fafd 70%, #eaf6ff 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .orders-timeline-header {
          width: 100%;
          max-width: 800px;
          display: flex;
          align-items: center;
          gap: 9px;
          font-weight: 900;
          font-size: 26px;
          color: #223964;
          justify-content: center;
          padding: 37px 0 23px 0;
        }
        .orders-timeline-icon { color: #246bfd; font-size: 23px;}
        .jobtype {
          font-size: 16px;
          color: #19ad5b;
          background: #eafef1;
          padding: 4px 17px;
          border-radius: 8px;
          margin-right: 13px;
          font-weight: 800;
          margin-left: 7px;
        }
        .orders-timeline-list {
          width: 100%;
          max-width: 640px;
          margin: 0 auto;
          position: relative;
          padding-bottom: 35px;
        }
        .orders-timeline-empty {
          color: #b3bccc;
          background: #fff;
          border-radius: 13px;
          box-shadow: 0 2px 11px #e7eefd33;
          padding: 37px 12px 31px 12px;
          font-size: 18px;
          font-weight: 700;
          text-align: center;
          margin: 50px auto;
        }
        .timeline-item {
          display: flex;
          flex-direction: row-reverse;
          align-items: flex-start;
          gap: 14px;
          position: relative;
          margin-bottom: 31px;
          min-width: 0;
        }
        .timeline-dot {
          width: 37px;
          height: 37px;
          background: linear-gradient(140deg,#fafdff 60%,#dde7fa 100%);
          border-radius: 50%;
          box-shadow: 0 3px 13px #e7eefd2f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
        }
        .timeline-content {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 4px 18px #e7eefd26;
          padding: 14px 19px 10px 19px;
          min-width: 0;
          flex: 1;
        }
        .timeline-row {
          display: flex;
          justify-content: space-between;
          font-size: 15.7px;
          margin-bottom: 4px;
        }
        .timeline-label { color: #8ba0be; font-weight: 700; font-size: 15px; }
        .timeline-num {
          color: #246bfd;
          background: #f3faff;
          font-weight: 900;
          font-size: 16.5px;
          border-radius: 8px;
          padding: 3px 13px;
          letter-spacing: .10em;
        }
        .timeline-badge {
          font-weight: 900;
          border-radius: 8px;
          padding: 4px 14px;
          font-size: 15px;
        }
        .badge-danger {
          background: linear-gradient(90deg,#fff1f1 80%,#ffeaea 100%);
          color: #e74c3c;
          border: 1px solid #ffe6e6;
        }
        .badge-warning {
          background: linear-gradient(90deg,#fffbe6 80%,#fffae0 100%);
          color: #f39c12;
          border: 1px solid #fff5d1;
        }
        .badge-success {
          background: linear-gradient(90deg,#eafef1 80%,#e2fbe7 100%);
          color: #19ad5b;
          border: 1px solid #c8f5d6;
        }
        .badge-default {
          background: #eef2f5;
          color: #4a5677;
          border: 1px solid #dde1ee;
        }
        .timeline-line {
          position: absolute;
          right: 18.5px;
          top: 37px;
          width: 2.4px;
          height: calc(100% - 37px + 21px);
          background: linear-gradient(to bottom,#dde7fa 80%,#eaf6ff 100%);
          z-index: 0;
        }
        @media (max-width: 700px) {
          .orders-timeline-header { font-size: 18.2px; }
          .timeline-content { padding: 9px 8px 7px 8px;}
        }
      `}</style>
    </div>
  );
}

// Helper icons/colors
function getStatusIcon(priority) {
  const p = (priority || '').toLowerCase();
  if (p.includes("عالي") || p.includes("مستعجل") || p.includes("high")) return <FaClock color="#e74c3c" />;
  if (p.includes("متوسط") || p.includes("medium")) return <FaArrowLeft color="#f39c12" />;
  if (p.includes("عادي") || p.includes("low")) return <FaCheckCircle color="#19ad5b" />;
  return <FaClipboardList color="#aaa" />;
}
function badgeColor(priority) {
  const p = (priority || '').toLowerCase();
  if (p.includes("عالي") || p.includes("مستعجل") || p.includes("high")) return "badge-danger";
  if (p.includes("متوسط") || p.includes("medium")) return "badge-warning";
  if (p.includes("عادي") || p.includes("low")) return "badge-success";
  return "badge-default";
}
function badgePriority(priority) {
  if (!priority) return "-";
  const p = priority.toLowerCase();
  if (p.includes("عالي") || p.includes("مستعجل") || p.includes("high")) return "مستعجل";
  if (p.includes("متوسط") || p.includes("medium")) return "متوسط";
  if (p.includes("عادي") || p.includes("low")) return "عادي";
  return priority;
}
