import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
const BASE_URL = process.env.REACT_APP_API_URL;

const monthsList = [
  { value: 1, label: "يناير" }, { value: 2, label: "فبراير" }, { value: 3, label: "مارس" },
  { value: 4, label: "أبريل" }, { value: 5, label: "مايو" }, { value: 6, label: "يونيو" },
  { value: 7, label: "يوليو" }, { value: 8, label: "أغسطس" }, { value: 9, label: "سبتمبر" },
  { value: 10, label: "أكتوبر" }, { value: 11, label: "نوفمبر" }, { value: 12, label: "ديسمبر" },
];
const yearsList = [2025, 2026, 2027, 2028, 2029, 2030];

function DailyBarChart({ data, month, year }) {
  return (
    <div style={{ background: "#e5f8f7", padding: 18, borderRadius: 14, minHeight: 250 }}>
      <h3 style={{ marginBottom: 18, fontSize: 18, color: "#1989a3" }}>
        عدد الشحنات اليومية ({monthsList.find(m => m.value === month)?.label}/{year})
      </h3>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={data}>
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ fontSize: 14, borderRadius: 8 }}
            labelFormatter={d => `اليوم ${d}`}
            formatter={(value, name) => [`${value}`, name === "shipped" ? "شحنات" : name]}
          />
          <Bar dataKey="shipped" fill="#1989a3" radius={[7, 7, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function DashboardPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const [visits, setVisits] = useState(0);
  const [sales, setSales] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [goal, setGoal] = useState(0);
  const [goalInput, setGoalInput] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);

  const [dailyStats, setDailyStats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [blockedStaff, setBlockedStaff] = useState([]);
  const [latestOrders, setLatestOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${BASE_URL}/api/dashboard/goal?year=${year}&month=${month}`)
        .then(res => res.json())
        .then(data => setGoal(data.value || 0)),

      fetch(`${BASE_URL}/api/dashboard/monthly-summary?year=${year}&month=${month}`)
        .then(res => res.json())
        .then(data => {
          setVisits(data.customersCount || 0);
          setSales(data.salesCount || 0);
          setCompletedOrders(data.shippedOrdersCount || 0);
        }),

      fetch(`${BASE_URL}/api/dashboard/daily-shipments?year=${year}&month=${month}`)
        .then(res => res.json())
        .then(data => setDailyStats(Array.isArray(data) ? data : [])),

      fetch(`${BASE_URL}/api/dashboard/latest-events?limit=20`)
        .then(res => res.json())
        .then(data => setNotifications(Array.isArray(data) ? data : [])),

      fetch(`${BASE_URL}/api/dashboard/blocked-staff`)
        .then(res => res.json())
        .then(data => setBlockedStaff(Array.isArray(data) ? data : [])),

      fetch(`${BASE_URL}/api/dashboard/latest-shipped-orders?limit=20`)
        .then(res => res.json())
        .then(data => setLatestOrders(Array.isArray(data) ? data : [])),
    ])
      .finally(() => setLoading(false));
  }, [month, year]);

  function handleSaveGoal() {
    setSavingGoal(true);
    setLoading(true);
    fetch(`${BASE_URL}/api/dashboard/goal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, month, value: Number(goalInput) })
    })
      .then(res => res.json())
      .then(data => {
        setGoal(Number(goalInput));
        setGoalInput("");
        setSavingGoal(false);
        setLoading(false);
        alert("تم تحديث الهدف الشهري");
      })
      .catch(() => {
        setSavingGoal(false);
        setLoading(false);
      });
  }

  return (
    <div style={{ padding: 30, background: "#f5f8fa", minHeight: "100vh", direction: "rtl" }}>
      {(loading || savingGoal) && (
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

      <h1 style={{ fontWeight: 900, color: "#26334a", marginBottom: 25, fontSize: 28 }}>
        لوحة التحكم (ملخص شهر {monthsList.find(m => m.value === month)?.label} {year})
      </h1>

      <div style={{ display: "flex", gap: 20, marginBottom: 22, alignItems: "center" }}>
        <span style={{ fontWeight: 700 }}>السنة:</span>
        <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ padding: 7, borderRadius: 7 }}>
          {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span style={{ fontWeight: 700 }}>الشهر:</span>
        <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ padding: 7, borderRadius: 7 }}>
          {monthsList.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))", gap: 20, marginBottom: 25 }}>
        <div style={{ background: "#fff", borderRadius: 11, padding: 22, border: "1px solid #e0e6f3" }}>
          <div style={{ color: "#2360b4", fontWeight: 900, fontSize: 32 }}>{visits}</div>
          <div style={{ color: "#4b6584", fontSize: 16, fontWeight: 700, marginTop: 7 }}>عدد العملاء</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 11, padding: 22, border: "1px solid #e0e6f3" }}>
          <div style={{ color: "#17a858", fontWeight: 900, fontSize: 32 }}>{sales}</div>
          <div style={{ color: "#4b6584", fontSize: 16, fontWeight: 700, marginTop: 7 }}> عدد الطلبات</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 11, padding: 22, border: "1px solid #e0e6f3" }}>
          <div style={{ color: "#e97e32", fontWeight: 900, fontSize: 32 }}>{completedOrders}</div>
          <div style={{ color: "#4b6584", fontSize: 16, fontWeight: 700, marginTop: 7 }}>الطلبات المنجزة</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 11, padding: 22, border: "1px solid #e0e6f3" }}>
          <div style={{ color: "#296ab1", fontWeight: 900, fontSize: 30 }}>
            {goal}
            <span style={{ fontSize: 13, color: "#aaa", marginRight: 4 }}>هدف</span>
          </div>
          <div style={{ color: "#4b6584", fontSize: 16, fontWeight: 700, marginTop: 7, marginBottom: 4 }}>الهدف الشهري</div>
          <form onSubmit={e => { e.preventDefault(); handleSaveGoal(); }}>
            <input type="number" min="1" value={goalInput}
              onChange={e => setGoalInput(e.target.value)} placeholder="تحديث الهدف..."
              style={{ width: 74, padding: "3px 9px", border: "1.5px solid #b1becb", borderRadius: 6, marginLeft: 5 }} />
            <button type="submit" disabled={savingGoal || !goalInput}
              style={{ background: "#207be1", color: "#fff", padding: "5px 14px", borderRadius: 7, border: "none", fontWeight: 800 }}>
              {savingGoal ? "جاري الحفظ..." : "تحديث"}
            </button>
          </form>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, alignItems: "flex-start" }}>
        <DailyBarChart data={dailyStats} month={month} year={year} />

        <div style={{ background: "#fff", borderRadius: 13, padding: 18, minHeight: 270, border: "1px solid #e0e6f3" }}>
          <h3 style={{ fontWeight: 800, color: "#c6530f", fontSize: 17, marginBottom: 10 }}>التنبيهات/أحداث حديثة</h3>
          <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
            {notifications.length === 0 && <li style={{ color: "#aaa" }}>لا توجد أحداث حالياً.</li>}
            {notifications.map((n, i) =>
              <li key={i} style={{ padding: "7px 0", borderBottom: "1px solid #f5f5f5", fontSize: 15 }}>
                <span style={{ color: "#207be1", fontWeight: 800 }}>{n.stepName}</span>
                <span style={{ margin: "0 8px", color: "#666" }}>{n.employee}</span>
                <span style={{ color: "#3b4861" }}>طلب #{n.orderNumber}</span>
                <span style={{ float: "left", color: "#888", fontSize: 13 }}>{n.date}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
  
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginTop: 36 }}>
        <div style={{ background: "#fff", borderRadius: 13, padding: 18, minHeight: 120, border: "1px solid #e0e6f3" }}>
          <h3 style={{ fontWeight: 800, color: "#d7263d", fontSize: 17, marginBottom: 10 }}>الموظفون الموقوفون</h3>
          <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
            {blockedStaff.length === 0 && <li style={{ color: "#aaa" }}>لا يوجد موظفون موقوفون.</li>}
            {blockedStaff.map((s, i) =>
              <li key={i} style={{ padding: "7px 0", borderBottom: "1px solid #f5f5f5", fontSize: 15 }}>
                <span style={{ fontWeight: 700, color: "#b12020" }}>{s.name}</span> - {s.jobType}
              </li>
            )}
          </ul>
        </div>
        <div style={{ background: "#fff", borderRadius: 13, padding: 18, minHeight: 120, border: "1px solid #e0e6f3" }}>
          <h3 style={{ fontWeight: 800, color: "#207be1", fontSize: 17, marginBottom: 10 }}>أحدث الطلبات المنجزة</h3>
          <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
            {latestOrders.length === 0 && <li style={{ color: "#aaa" }}>لا توجد طلبات منجزة حالياً.</li>}
            {latestOrders.map((o, i) =>
              <li key={i} style={{ padding: "7px 0", borderBottom: "1px solid #f5f5f5", fontSize: 15 }}>
                <span style={{ color: "#207be1", fontWeight: 800 }}>#{o.orderNumber}</span>
                <span style={{ margin: "0 8px", color: "#555" }}>{o.customer}</span>
                <span style={{ float: "left", color: "#666", fontSize: 13 }}>{o.shippedAt}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
