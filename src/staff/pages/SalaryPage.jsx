import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
const BASE_URL = process.env.REACT_APP_API_URL;
// الأشهر والسنوات
const months = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];
const years = Array.from({ length: 7 }, (_, i) => 2030 - i);

export default function SalaryPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeId = user?._id;

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  function getPeriod(year, month) {
    const from = `${year}-${month.toString().padStart(2, "0")}-01`;
    const to = `${year}-${month.toString().padStart(2, "0")}-${new Date(year, month, 0).getDate()}`;
    return { from, to };
  }

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true); // هنا تظهر شاشة التحميل
    const { from, to } = getPeriod(year, month);
    fetch(`${BASE_URL}/api/employee-summary/${employeeId}?from=${from}&to=${to}`)
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => { setStats(null); setLoading(false); });
  }, [employeeId, year, month]);

  let chartData = [];
  if (stats?.dailyStats) {
    chartData = Object.entries(stats.dailyStats).map(([date, count]) => ({
      date: Number(date.split("-")[2]),
      count,
    }));
    chartData.sort((a, b) => a.date - b.date);
  }

  const today = new Date();
  const hijri = today.toLocaleDateString("ar-SA-u-ca-islamic", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="salary-app">
      {/* شاشة تحميل الصفحة */}
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

      {/* Header */}
      <header className="salary-header">
        <div className="salary-header-bg" />
        <h2>
          <span>ملخص الموظف</span>
          <div className="salary-period">
            <span>شهر</span>
            <span className="salary-month">{months[month - 1]}</span>
            <span>{year}</span>
          </div>
        </h2>
        <div className="salary-controls">
          <select value={year} onChange={e => setYear(Number(e.target.value))}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={month} onChange={e => setMonth(Number(e.target.value))}>
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div className="salary-date">
          <span>اليوم: {today.toLocaleDateString("ar-SA")}</span>
          <span className="salary-hijri">(هجري: {hijri})</span>
        </div>
      </header>

      {/* Cards */}
      <section className="salary-cards">
        <div className="salary-card">
          <div className="salary-card-num">{stats?.totalOrders ?? "-"}</div>
          <div className="salary-card-label">عدد الطلبات المنجزة</div>
        </div>
        <div className="salary-card">
          <div className="salary-card-num green">
            {stats?.totalAmount?.toLocaleString() ?? "-"} <span>ريال</span>
          </div>
          <div className="salary-card-label">إجمالي المستحقات</div>
        </div>
      </section>

      {/* Bar Chart */}
      <section className="salary-chart-section">
        <h4>عدد الطلبات المنجزة يومياً</h4>
        {loading ? (
          <div className="salary-loading">جاري تحميل البيانات...</div>
        ) : chartData.length === 0 ? (
          <div className="salary-nodata">لا توجد بيانات بعد.</div>
        ) : (
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={13} />
              <YAxis allowDecimals={false} fontSize={13} />
              <Tooltip />
              <Bar dataKey="count" fill="#246bfd" barSize={28} radius={[9, 9, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Table */}
      <section className="salary-table-section">
        <div className="salary-table-title">
          قائمة كل الطلبات التي تم العمل عليها خلال الفترة:
        </div>
        {stats?.ordersWorked?.length > 0 ? (
          <div className="salary-table-wrapper">
            <table className="salary-table">
              <thead>
                <tr>
                  <th>الموديل</th>
                  <th>المقاس</th>
                  <th>القماش</th>
                  <th>تسلسل القطعة</th>
                  <th>الأولوية</th>
                  <th>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {stats.ordersWorked.map((item, idx) => (
                  <tr key={item._id || idx}>
                    <td>{item.model || "-"}</td>
                    <td>{item.size || "-"}</td>
                    <td>{item.fabric || "-"}</td>
                    <td>{item.pieceSequence || "-"}</td>
                    <td>{item.priority || "-"}</td>
                    <td>{item.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="salary-nodata">لا توجد طلبات تم العمل عليها خلال الفترة المختارة.</div>
        )}
      </section>

      {/* CSS داخل JSX (ممكن تفصلها في ملف .css) */}
      <style>{`
        .salary-app {
          direction: rtl;
          font-family: 'Cairo', Tahoma, Arial, sans-serif;
          background: #f4f7fb;
          min-height: 100vh;
          padding-bottom: 50px;
        }
        .salary-header {
          position: relative;
          padding: 38px 14px 25px 14px;
          border-radius: 0 0 28px 28px;
          background: linear-gradient(110deg, #246bfd 75%, #0098e5 100%);
          color: #fff;
          box-shadow: 0 2px 24px 0 #0072b91a;
          margin-bottom: 32px;
          text-align: center;
        }
        .salary-header-bg {
          position: absolute;
          inset: 0;
          border-radius: 0 0 28px 28px;
          background: url('https://assets-global.website-files.com/654cebb6c880552fd686a50d/655c9cbb34cfc287d7b21ab5_bg-blur.png') center/cover no-repeat;
          opacity: .12;
          z-index: 0;
        }
        .salary-header > * { position: relative; z-index: 1; }
        .salary-header h2 {
          font-weight: 900;
          font-size: 28px;
          margin: 0 0 10px;
          letter-spacing: 0.1px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .salary-period { display: flex; gap: 4px; align-items: center; font-size: 18px; font-weight: 600; }
        .salary-month { color: #ffe577; margin: 0 2px; font-weight: 900; letter-spacing: 1px; }
        .salary-controls {
          display: flex;
          gap: 11px;
          justify-content: center;
          align-items: center;
          margin: 8px 0;
        }
        .salary-controls select {
          min-width: 85px;
          font-size: 16px;
          padding: 7px 13px;
          border-radius: 11px;
          border: none;
          background: #fff;
          color: #246bfd;
          font-weight: 800;
          box-shadow: 0 0 0.5px #a7c3f7;
          outline: none;
          transition: box-shadow .2s;
        }
        .salary-controls select:focus { box-shadow: 0 0 4px #f3e367; }
        .salary-date {
          color: #fff;
          font-weight: 600;
          font-size: 16px;
          margin-top: 6px;
          text-shadow: 0 2px 14px #246bfd44;
        }
        .salary-hijri { color: #ffe577; margin-right: 9px; font-size: 13px; }

        .salary-cards {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 26px;
        }
        .salary-card {
          background: #fff;
          border-radius: 19px;
          padding: 22px 13px 14px 13px;
          min-width: 150px;
          text-align: center;
          box-shadow: 0 4px 18px 0 #d7e3fa36;
          border: 1.5px solid #e4ecf7;
          transition: box-shadow .16s;
        }
        .salary-card:hover { box-shadow: 0 4px 30px 0 #c9e0ff44; }
        .salary-card-num {
          font-size: 32px;
          font-weight: 900;
          color: #246bfd;
          margin-bottom: 6px;
        }
        .salary-card-num.green { color: #24b96f; }
        .salary-card-label {
          font-size: 16px;
          color: #333;
          font-weight: 700;
          opacity: .93;
        }

        .salary-chart-section {
          background: #fff;
          border-radius: 21px;
          padding: 23px 14px 20px 14px;
          margin: 0 auto 35px auto;
          box-shadow: 0 2px 12px #d7e3fa26;
          max-width: 700px;
        }
        .salary-chart-section h4 {
          color: #263143;
          font-weight: 900;
          font-size: 19px;
          margin-bottom: 15px;
          text-align: center;
        }
        .salary-loading, .salary-nodata {
          color: #6d6d6d;
          text-align: center;
          font-size: 17px;
          padding: 25px 0;
        }

        .salary-table-section {
          background: #fff;
          border-radius: 19px;
          padding: 25px 9px 9px 9px;
          margin: 24px auto 0 auto;
          box-shadow: 0 2px 12px #d7e3fa26;
          max-width: 900px;
        }
        .salary-table-title {
          font-weight: 900;
          font-size: 19px;
          color: #246bfd;
          margin-bottom: 17px;
          text-align: center;
        }
        .salary-table-wrapper {
          overflow-x: auto;
        }
        .salary-table {
          margin: 0 auto;
          font-size: 16px;
          border-collapse: collapse;
          width: 99%;
          min-width: 550px;
        }
        .salary-table th, .salary-table td {
          padding: 9px 4px;
          border-bottom: 1px solid #f0f3f7;
          text-align: center;
        }
        .salary-table thead tr { background: #f4f8fe; }
        .salary-table tbody tr:nth-child(odd) { background: #fafcff; }
      `}</style>
    </div>
  );
}
