import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
const BASE_URL = process.env.REACT_APP_API_URL;
export default function StockLogPage() {
  const { id } = useParams(); // هنا ناخذ id المخزون من الرابط
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fabric, setFabric] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!id) return setMsg("لم يتم تحديد رقم المخزون!");
    setMsg("");
    setLoading(true);

    // جلب بيانات القماش نفسه
    fetch(`${BASE_URL}/api/fabrics`)
      .then(res => res.json())
      .then(data => {
        const found = (Array.isArray(data) ? data : []).find(f => f._id === id);
        setFabric(found || null);
      });

    // جلب سجل الحركة لهذا القماش
    fetch(`${BASE_URL}/api/fabrics/log/${id}`)
      .then(res => res.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setLogs([]);
        setMsg("تعذر جلب السجل");
        setLoading(false);
      });
  }, [id]);

  if (!id) {
    return <div style={{ padding: 32 }}>❌ لم يتم تحديد رقم المخزون!</div>;
  }

  return (
    <div style={{ padding: 32, direction: "rtl", maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 12 }}>
        سجل حركة المخزون
        {fabric && (
          <span style={{ color: "#2563eb", marginRight: 10, fontSize: 20 }}>
            - {fabric.name} (كود: {fabric.code})
          </span>
        )}
      </h2>
      {msg && <div style={{ color: "red", marginBottom: 16 }}>{msg}</div>}

      {loading ? (
        <div>جاري تحميل السجل...</div>
      ) : logs.length === 0 ? (
        <div>لا يوجد سجل حركة لهذا الصنف.</div>
      ) : (
        <table border="1" cellPadding={8} style={{ width: "100%", textAlign: "center", background: "#fff" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th>التاريخ</th>
              <th>العملية</th>
              <th>الكمية</th>
              <th>تكلفة الوحدة</th>
              <th>اسم المستخدم</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={log._id || i}>
                <td>{log.createdAt ? log.createdAt.slice(0, 10) : "-"}</td>
                <td style={{ color: log.type === "in" ? "#068" : "#a00", fontWeight: "bold" }}>
                  {log.type === "in" ? "دخول" : "خروج"}
                </td>
                <td>{log.qty}</td>
                <td>{log.cost || "-"}</td>
                <td>{log.employeeUsername || "-"}</td>
                <td>{log.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
