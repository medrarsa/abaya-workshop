import React, { useEffect, useState } from "react";
const BASE_URL = process.env.REACT_APP_API_URL;
const colors = {
  main: "#0078D7",
  light: "#e6f2fb",
  border: "#e1e8ed",
  danger: "#e74c3c",
  warn: "#ffbe3d",
  gray: "#8a97a9",
  archived: "#f6f7f8",
  green: "#18b67b",
  tableHead: "#f4f8fb"
};

const btnBase = {
  border: "none",
  outline: "none",
  padding: "8px 18px",
  margin: "0 6px",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "14px",
  cursor: "pointer",
  boxShadow: "0 1px 3px 0 #ececec"
};

export default function InventoryPage() {
  // ...نفس الكود تبعك بالضبط (ما غيرت شيء فيه)... //
  // =============== متغيرات الحالة ===============
  const [fabrics, setFabrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    currentStock: "",
    minAlert: "",
    unitPrice: ""
  });
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState("");

  const [showAddStock, setShowAddStock] = useState(false);
  const [stockForm, setStockForm] = useState({
    qty: "",
    cost: "",
    fabricId: "",
  });
  const [stockMsg, setStockMsg] = useState("");
  const [stockLoading, setStockLoading] = useState(false);

  // سجل الحركة
  const [showLog, setShowLog] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logFabricId, setLogFabricId] = useState("");
  const [logFrom, setLogFrom] = useState("");
  const [logTo, setLogTo] = useState("");

  // اسم الموظف الحالي
  let user = null;
  let employeeUsername = "";
  try {
    user = JSON.parse(localStorage.getItem("user"));
    employeeUsername = user && user.username ? user.username : "";
  } catch (e) {
    employeeUsername = "";
  }

  // جلب الأقمشة مع فلتر المؤرشفين
  useEffect(() => {
    setLoading(true);
    let url = `${BASE_URL}/api/fabrics`;
    if (showArchived) url += "?archived=true";
    else url += "?archived=false";
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setFabrics(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setFabrics([]);
        setLoading(false);
      });
  }, [showArchived]);

  function handleAddFabric(e) {
    e.preventDefault();
    setAdding(true);
    setAddMsg("");
    fetch(`${BASE_URL}/api/fabrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        code: form.code,
        currentStock: Number(form.currentStock),
        minAlert: Number(form.minAlert),
        unitPrice: Number(form.unitPrice)
      })
    })
      .then(res => res.json())
      .then(data => {
        setAdding(false);
        if (data._id) {
          setAddMsg("تمت إضافة القماش بنجاح!");
          setShowAdd(false);
          setForm({ name: "", code: "", currentStock: "", minAlert: "", unitPrice: "" });
          setFabrics(fabs => [...fabs, data]);
        } else {
          setAddMsg(data.error || "خطأ في الإضافة");
        }
      })
      .catch(() => {
        setAddMsg("خطأ في الإضافة");
        setAdding(false);
      });
  }

  function openAddStockModal(fabricId) {
    setStockForm({ qty: "", cost: "", fabricId });
    setStockMsg("");
    setShowAddStock(true);
  }

  function handleAddStock(e) {
    e.preventDefault();
    setStockLoading(true);
    setStockMsg("");

    let username = "";
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.username) username = user.username;
    } catch (e) { username = ""; }

    if (!username) {
      setStockMsg("خطأ: يجب تسجيل الدخول باسم مستخدم حقيقي لإضافة كمية!");
      setStockLoading(false);
      return;
    }

    fetch(`${BASE_URL}/api/fabrics/add-stock/${stockForm.fabricId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        qty: Number(stockForm.qty),
        cost: Number(stockForm.cost),
        employeeUsername: username
      })
    })
      .then(res => res.json())
      .then(data => {
        setStockLoading(false);
        if (data._id) {
          setStockMsg("تمت إضافة الكمية!");
          setFabrics(fabs =>
            fabs.map(f =>
              f._id === data._id ? { ...f, currentStock: data.currentStock, unitPrice: data.unitPrice } : f
            )
          );
          setShowAddStock(false);
        } else {
          setStockMsg(data.error || "خطأ في إضافة الكمية");
        }
      })
      .catch(() => {
        setStockMsg("خطأ في إضافة الكمية");
        setStockLoading(false);
      });
  }

  // ==== سجل الحركة مع فلترة التاريخ
  function openLogModal(fabricId) {
    setShowLog(true);
    setLogLoading(true);
    setLogFabricId(fabricId);
    setLogFrom(""); setLogTo("");
    fetchLogs(fabricId, "", "");
  }

  function fetchLogs(fabricId, from, to) {
    let url = `${BASE_URL}/api/fabrics/log/${fabricId}`;
    let params = [];
    if (from) params.push(`from=${from}`);
    if (to) params.push(`to=${to}`);
    if (params.length > 0) url += "?" + params.join("&");
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setLogs(Array.isArray(data) ? data : []);
        setLogLoading(false);
      })
      .catch(() => {
        setLogs([]);
        setLogLoading(false);
      });
  }

  function handleArchive(id) {
    if (!window.confirm("هل أنت متأكد من أرشفة هذا القماش؟")) return;
    fetch(`${BASE_URL}/api/fabrics/archive/${id}`, { method: "PUT" })
      .then(res => res.json())
      .then(() => {
        setFabrics(fabs => fabs.filter(f => f._id !== id));
      });
  }

  function handleRestore(id) {
    if (!window.confirm("استرجاع هذا القماش للنظام؟")) return;
    fetch(`${BASE_URL}/api/fabrics/restore/${id}`, { method: "PUT" })
      .then(res => res.json())
      .then(() => {
        setFabrics(fabs => fabs.filter(f => f._id !== id));
      });
  }

  // =================== الواجهة ===================
  return (
    <div style={{
      padding: "32px 6vw",
      background: "#f5f8fa",
      minHeight: "100vh",
      fontFamily: "'Cairo', Tahoma, Arial"
    }}>
      <h2 style={{ marginBottom: 24, color: colors.main, fontWeight: 900, fontSize: 32, letterSpacing: 1 }}>لوحة إدارة المخزون</h2>
      {employeeUsername && (
        <div style={{
          color: colors.gray, marginBottom: 16, fontWeight: "bold",
          fontSize: 16, background: "#fff", borderRadius: 12, padding: "10px 18px",
          display: "inline-block", border: `1px solid ${colors.border}`
        }}>
          <span style={{ color: colors.green, marginLeft: 8 }}>●</span>
          الموظف الحالي: <span style={{ color: colors.main }}>{employeeUsername}</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 28, alignItems: "center" }}>
        <button
          style={{ ...btnBase, background: colors.main, color: "#fff" }}
          onClick={() => setShowAdd(true)}
        >+ إضافة قماش جديد</button>

        <button
          style={{
            ...btnBase,
            background: showArchived ? colors.green : "#fff",
            color: showArchived ? "#fff" : colors.main,
            border: `1px solid ${colors.border}`
          }}
          onClick={() => setShowArchived(a => !a)}
        >
          {showArchived ? "عرض النشط فقط" : "عرض المؤرشفين"}
        </button>
      </div>

      {/* نموذج إضافة القماش */}
      {showAdd && (
        <div style={{
          background: "#fff", border: `1.5px solid ${colors.border}`,
          borderRadius: 18, padding: 26, marginBottom: 24,
          boxShadow: "0 6px 32px 0 #e0e6ee26"
        }}>
          <form onSubmit={handleAddFabric} style={{ display: "grid", gap: 14 }}>
            <h3 style={{ color: colors.main, fontWeight: "bold" }}>إضافة قماش جديد</h3>
            <div><input placeholder="اسم القماش" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required style={{ width: 220, padding: 10, borderRadius: 8, border: `1px solid ${colors.border}` }} /></div>
            <div><input placeholder="كود القماش (مثل F100)" value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              required style={{ width: 220, padding: 10, borderRadius: 8, border: `1px solid ${colors.border}` }} /></div>
            <div><input placeholder="الكمية المتوفرة" value={form.currentStock}
              type="number" min="0"
              onChange={e => setForm(f => ({ ...f, currentStock: e.target.value }))}
              required style={{ width: 220, padding: 10, borderRadius: 8, border: `1px solid ${colors.border}` }} /></div>
            <div><input placeholder="حد التنبيه" value={form.minAlert}
              type="number" min="0"
              onChange={e => setForm(f => ({ ...f, minAlert: e.target.value }))}
              required style={{ width: 220, padding: 10, borderRadius: 8, border: `1px solid ${colors.border}` }} /></div>
            <div><input placeholder="سعر المتر" value={form.unitPrice}
              type="number" min="0"
              onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))}
              required style={{ width: 220, padding: 10, borderRadius: 8, border: `1px solid ${colors.border}` }} /></div>
            <div>
              <button type="submit" disabled={adding}
                style={{ ...btnBase, background: colors.green, color: "#fff" }}>
                {adding ? "جاري الإضافة..." : "إضافة"}
              </button>
              <button type="button" onClick={() => setShowAdd(false)}
                style={{ ...btnBase, background: "#fff", color: colors.danger, border: `1px solid ${colors.danger}` }}>
                إلغاء
              </button>
            </div>
            {addMsg &&
              <div style={{
                color: addMsg.includes("نجاح") ? colors.green : colors.danger,
                background: "#f8f9fa", borderRadius: 6, marginTop: 5, padding: "6px 10px", fontWeight: 600
              }}>{addMsg}</div>
            }
          </form>
        </div>
      )}

      {/* إضافة كمية */}
      {showAddStock && (
        <div style={{
          background: "#fff", border: `1.5px solid ${colors.green}`,
          borderRadius: 18, padding: 26, marginBottom: 24,
          boxShadow: "0 6px 32px 0 #e0e6ee26"
        }}>
          <form onSubmit={handleAddStock} style={{ display: "grid", gap: 14 }}>
            <h3 style={{ color: colors.green, fontWeight: "bold" }}>إضافة كمية للمخزون</h3>
            <div><input placeholder="الكمية المضافة" value={stockForm.qty}
              type="number" min="1"
              onChange={e => setStockForm(f => ({ ...f, qty: e.target.value }))}
              required style={{ width: 220, padding: 10, borderRadius: 8, border: `1px solid ${colors.border}` }} /></div>
            <div><input placeholder="تكلفة الوحدة (المتر)" value={stockForm.cost}
              type="number" min="0"
              onChange={e => setStockForm(f => ({ ...f, cost: e.target.value }))}
              required style={{ width: 220, padding: 10, borderRadius: 8, border: `1px solid ${colors.border}` }} /></div>
            <div>
              <button type="submit" disabled={stockLoading}
                style={{ ...btnBase, background: colors.main, color: "#fff" }}>
                {stockLoading ? "جاري الإضافة..." : "إضافة الكمية"}
              </button>
              <button type="button" onClick={() => setShowAddStock(false)}
                style={{ ...btnBase, background: "#fff", color: colors.danger, border: `1px solid ${colors.danger}` }}>
                إلغاء
              </button>
            </div>
            {stockMsg &&
              <div style={{
                color: stockMsg.includes("تمت") ? colors.green : colors.danger,
                background: "#f8f9fa", borderRadius: 6, marginTop: 5, padding: "6px 10px", fontWeight: 600
              }}>{stockMsg}</div>
            }
          </form>
        </div>
      )}

      {/* سجل الحركة */}
      {showLog && (
        <div style={{
          background: "#f7fff7", border: `2px solid ${colors.green}`, borderRadius: 14,
          padding: 18, marginBottom: 24, boxShadow: "0 2px 16px 0 #e0e6ee24"
        }}>
          <h3 style={{ color: colors.green, fontWeight: "bold" }}>سجل حركة المخزون</h3>
          <form
            onSubmit={e => {
              e.preventDefault();
              setLogLoading(true);
              fetchLogs(logFabricId, logFrom, logTo);
            }}
            style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "flex-end" }}
          >
            <div>
              <label style={{ fontWeight: 600 }}>من تاريخ:</label><br />
              <input type="date" value={logFrom}
                onChange={e => setLogFrom(e.target.value)}
                style={{ padding: 8, borderRadius: 6, border: `1px solid ${colors.border}` }} />
            </div>
            <div>
              <label style={{ fontWeight: 600 }}>إلى تاريخ:</label><br />
              <input type="date" value={logTo}
                onChange={e => setLogTo(e.target.value)}
                style={{ padding: 8, borderRadius: 6, border: `1px solid ${colors.border}` }} />
            </div>
            <button type="submit"
              style={{ ...btnBase, background: colors.main, color: "#fff" }}>
              بحث
            </button>
            <button type="button" onClick={() => { setLogFrom(""); setLogTo(""); fetchLogs(logFabricId, "", ""); }}
              style={{ ...btnBase, background: "#fff", color: colors.green, border: `1px solid ${colors.green}` }}>
              تصفير
            </button>
          </form>
          {logLoading ? (
            <div style={{ color: colors.gray }}>جاري التحميل...</div>
          ) : (
            <table style={{
              width: "100%", textAlign: "center", background: "#fff",
              borderCollapse: "separate", borderSpacing: 0, borderRadius: 14, overflow: "hidden"
            }}>
              <thead>
                <tr style={{ background: colors.tableHead, fontWeight: 700 }}>
                  <th style={{ padding: 8 }}>التاريخ</th>
                  <th>العملية</th>
                  <th>الكمية</th>
                  <th>تكلفة الوحدة</th>
                  <th>اسم المستخدم</th>
                  <th>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 18, color: colors.gray, fontWeight: 600 }}>لا يوجد سجل حركة</td>
                  </tr>
                )}
                {logs.map((log, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fafcff" : "#fff" }}>
                    <td style={{ padding: 8 }}>{log.createdAt ? log.createdAt.slice(0, 10) : "-"}</td>
                    <td style={{ color: log.type === "in" ? colors.green : colors.danger, fontWeight: 800 }}>
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
          <button type="button" onClick={() => setShowLog(false)}
            style={{ ...btnBase, background: colors.danger, color: "#fff", marginTop: 18 }}>
            إغلاق
          </button>
        </div>
      )}

      {/* جدول الأقمشة */}
      {loading ? (
        <div style={{ color: colors.gray, fontWeight: 700, fontSize: 18, padding: 38 }}>جاري التحميل...</div>
      ) : (
        <div style={{
          background: "#fff", borderRadius: 18, boxShadow: "0 2px 16px 0 #e0e6ee12",
          border: `1px solid ${colors.border}`, marginTop: 16
        }}>
          <table style={{
            width: "100%", textAlign: "center",
            borderCollapse: "separate", borderSpacing: 0, fontSize: 15, borderRadius: 12, overflow: "hidden"
          }}>
            <thead>
              <tr style={{ background: colors.tableHead, fontWeight: 900 }}>
                <th style={{ padding: 12 }}>الكود</th>
                <th>اسم القماش</th>
                <th>الكمية المتوفرة</th>
                <th>حد التنبيه</th>
                <th>سعر المتر</th>
                <th>تاريخ الإضافة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {fabrics.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 28, color: colors.gray, fontWeight: 600 }}>لا توجد بيانات مخزون حتى الآن.</td>
                </tr>
              )}
              {fabrics.map((fabric, idx) => (
                <tr key={fabric._id}
                  style={{
                    background: fabric.archived ? colors.archived : (idx % 2 === 0 ? "#fcfdfe" : "#fff"),
                    color: fabric.archived ? colors.gray : "#222"
                  }}>
                  <td style={{ padding: 10 }}>{fabric.code || "-"}</td>
                  <td>{fabric.name}</td>
                  <td>{fabric.currentStock}</td>
                  <td style={{
                    color: Number(fabric.currentStock) <= Number(fabric.minAlert) ? colors.warn : "#111",
                    fontWeight: Number(fabric.currentStock) <= Number(fabric.minAlert) ? "bold" : "normal"
                  }}>{fabric.minAlert}</td>
                  <td>{fabric.unitPrice}</td>
                  <td>{fabric.createdAt ? fabric.createdAt.slice(0, 10) : "-"}</td>
                  <td>
                    {!fabric.archived && (
                      <>
                        <button onClick={() => openAddStockModal(fabric._id)}
                          style={{ ...btnBase, background: "#edfbe7", color: colors.green, border: `1px solid ${colors.green}` }}>
                          + إضافة كمية
                        </button>
                        <button onClick={() => openLogModal(fabric._id)}
                          style={{ ...btnBase, background: colors.light, color: colors.main, border: `1px solid ${colors.main}` }}>
                          سجل الحركة
                        </button>
                        <button onClick={() => handleArchive(fabric._id)}
                          style={{ ...btnBase, background: colors.danger, color: "#fff" }}>
                          🗂 أرشفة
                        </button>
                      </>
                    )}
                    {fabric.archived && (
                      <button onClick={() => handleRestore(fabric._id)}
                        style={{ ...btnBase, background: colors.green, color: "#fff" }}>
                        ⏪ استرجاع
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
