// src/staff/pages/WalletPage.jsx
import React, { useEffect, useState } from "react";
const BASE_URL = process.env.REACT_APP_API_URL;
const employee = JSON.parse(localStorage.getItem("user") || "{}");
const EMPLOYEE_ID = employee._id || employee.id || "";

const typeColor = {
  "مستحق": "#19ad5b",
  "دفعة": "#2563eb",
  "سلفة": "#f59e42",
  "خصم": "#d61f3c"
};

// جميع الشهور + خيار "كل الأشهر"
const months = [0,1,2,3,4,5,6,7,8,9,10,11,12];
const monthNames = [
  "كل الأشهر",
  "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

export default function WalletPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // فلتر التاريخ
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  useEffect(() => {
    if (!EMPLOYEE_ID) return;
    fetch(`${BASE_URL}/api/payments/by-employee/${EMPLOYEE_ID}`)
      .then(res => res.json())
      .then(data => {
        setPayments(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  // جلب جميع السنوات من الداتا
  const years = Array.from(new Set(payments.map(p => new Date(p.date).getFullYear()))).sort((a,b)=>b-a);
  if (years.length === 0) years.push(now.getFullYear()); // إذا لا يوجد بيانات، أضف السنة الحالية

  // الفلترة حسب السنة أو السنة+الشهر
  const filteredPayments = payments.filter(p => {
    const d = new Date(p.date);
    if (selectedMonth === 0) {
      return d.getFullYear() === selectedYear;
    }
    return d.getFullYear() === selectedYear && (d.getMonth() + 1) === selectedMonth;
  });

  // جمع الرصيد
  let totalDue = 0, totalPaid = 0, totalLoan = 0, totalDiscount = 0;
  filteredPayments.forEach(p => {
    if (p.type === "مستحق") totalDue += p.amount;
    if (p.type === "دفعة") totalPaid += p.amount;
    if (p.type === "سلفة") totalLoan += p.amount;
    if (p.type === "خصم") totalDiscount += p.amount;
  });
  const balance = totalDue - totalPaid - totalLoan - totalDiscount;

  // الحركات المعروضة (آخر 20 أو الكل)
  const displayedPayments = filteredPayments
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, showAll ? filteredPayments.length : 20);

  return (
    <div style={{
      maxWidth: 520,
      margin: "0 auto",
      background: "#f9fbfe",
      padding: 22,
      borderRadius: 18,
      boxShadow: "0 4px 28px #0001",
      fontFamily: "Tajawal, Arial",
      marginTop: 25
    }}>
      {/* فلاتر السنة والشهر */}
      <div style={{display:"flex", gap:12, marginBottom:10, justifyContent:"center"}}>
        <select value={selectedYear} onChange={e=>setSelectedYear(Number(e.target.value))}
          style={{fontSize:16, borderRadius:7, border:"1.5px solid #bbb", padding:"7px 12px", fontWeight:700}}>
          {years.map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <select value={selectedMonth} onChange={e=>setSelectedMonth(Number(e.target.value))}
          style={{fontSize:16, borderRadius:7, border:"1.5px solid #bbb", padding:"7px 12px", fontWeight:700}}>
          {months.map(m=>
            <option key={m} value={m}>{monthNames[m]}</option>
          )}
        </select>
      </div>

      <div style={{
        background: "#fff",
        borderRadius: 13,
        boxShadow: "0 4px 18px #19ad5b12",
        textAlign: "center",
        marginBottom: 18,
        padding: "30px 0"
      }}>
        <div style={{ fontSize: 26, color: "#19ad5b", fontWeight: 900, letterSpacing: 2 }}>
          💸 رصيدك في {selectedMonth === 0 ? "كل الأشهر" : monthNames[selectedMonth]} {selectedYear}
        </div>
        <div style={{
          fontSize: 40,
          fontWeight: 900,
          color: balance >= 0 ? "#19ad5b" : "#c4000b",
          margin: "12px 0"
        }}>{balance.toLocaleString()} <span style={{ fontSize: 20 }}>ريال</span></div>
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          fontWeight: 700,
          fontSize: 17,
          color: "#555",
          margin: "8px 0 2px 0"
        }}>
          <span>مستحقات: <b style={{ color: "#19ad5b" }}>{totalDue}</b></span>
          <span>دفعات: <b style={{ color: "#2563eb" }}>{totalPaid}</b></span>
        </div>
        <div style={{
          display: "flex",
          justifyContent: "space-around",
          fontWeight: 700,
          fontSize: 15,
          color: "#a7a7a7"
        }}>
          <span>سلف: <b style={{ color: "#f59e42" }}>{totalLoan}</b></span>
          <span>خصومات: <b style={{ color: "#d61f3c" }}>{totalDiscount}</b></span>
        </div>
      </div>

      {/* جدول آخر الحركات */}
      <div style={{
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 2px 8px #c9e4cc22",
        margin: "0 0 16px 0",
        padding: 14
      }}>
        <div style={{
          fontWeight: 700,
          fontSize: 20,
          color: "#0e4a27",
          marginBottom: 7,
          letterSpacing: 1,
          display: "flex",
          alignItems: "center"
        }}>
          🔄 آخر الحركات
        </div>
        <div style={{
          maxHeight: 420,
          overflowY: "auto"
        }}>
          {loading ? (
            <div style={{ color: "#888", fontSize: 18, textAlign: "center" }}>جار التحميل ...</div>
          ) : filteredPayments.length === 0 ? (
            <div style={{ color: "#888", fontSize: 16, textAlign: "center" }}>لا يوجد حركات مالية في هذا {selectedMonth === 0 ? "السنة" : "الشهر"}.</div>
          ) : (
            displayedPayments.map((p, idx) => (
              <div key={idx} style={{
                display: "flex",
                alignItems: "center",
                fontSize: 16,
                borderBottom: "1px solid #f3f3f3",
                padding: "6px 0"
              }}>
                <span style={{ width: 95, color: "#666" }}>
                  {new Date(p.date).toLocaleDateString("ar-EG")}
                </span>
                <span style={{
                  minWidth: 62,
                  color: typeColor[p.type] || "#555",
                  fontWeight: 900,
                  textAlign: "center"
                }}>{p.type}</span>
                <span style={{
                  fontWeight: 800,
                  color: (p.type === "مستحق" ? "#19ad5b" : (p.type === "خصم" || p.type === "سلفة") ? "#c4000b" : "#2563eb"),
                  direction: "ltr",
                  marginRight: 15
                }}>
                  {(p.type === "مستحق" ? "+" : "-")}{p.amount}
                </span>
                <span style={{
                  color: "#999",
                  fontSize: 14,
                  marginRight: 7
                }}>{p.notes ? p.notes : ""}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* زر عرض المزيد */}
      {filteredPayments.length > 20 && !showAll && (
        <button style={{
          width: "100%",
          padding: "13px 0",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontWeight: 800,
          fontSize: 20,
          letterSpacing: 1,
          boxShadow: "0 2px 8px #2563eb30",
          margin: "7px 0"
        }}
          onClick={() => setShowAll(true)}
        >
          المزيد
        </button>
      )}
      {showAll && (
        <div style={{ textAlign: "center", color: "#888", fontWeight: 700 }}>تم عرض جميع الحركات</div>
      )}
    </div>
  );
}
