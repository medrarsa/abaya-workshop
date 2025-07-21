import React, { useEffect, useState } from "react";
const BASE_URL = process.env.REACT_APP_API_URL;
// عنصر موحد للحقول
function FormField({ label, children }) {
  return (
    <div>
      <label style={{
        display: "block",
        marginBottom: "4px",
        color: "#555",
        fontWeight: 600,
        fontSize: 13.5
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [jobTypes, setJobTypes] = useState(["مدير"]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    username: "",
    password: "",
    jobType: "",
    salaryType: "",
    salaryAmount: "",
    status: "فعال"
  });
  const [msg, setMsg] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/employees`)
      .then(res => res.json())
      .then(setEmployees);
    fetch(`${BASE_URL}/api/stages`)
      .then(res => res.json())
      .then(data => {
        const types = Array.from(new Set(data.map(s => s.jobType).filter(Boolean)));
        setJobTypes(["مدير", ...types]);
      });
  }, []);

  function handleAddOrEditEmployee(e) {
    e.preventDefault();
    setMsg("");
    const api = editId ? `${BASE_URL}/api/employees/${editId}` : `${BASE_URL}/api/employees`;
    const method = editId ? "PUT" : "POST";
    const toSend = { ...form, salaryAmount: Number(form.salaryAmount) };
    if (editId && !form.password) delete toSend.password;
    fetch(api, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toSend)
    })
      .then(res => res.json())
      .then(data => {
        if (data._id || data.id) {
          if (editId) {
            setEmployees(prev =>
              prev.map(emp => (emp._id === editId ? data : emp))
            );
            setMsg("تم تعديل الموظف!");
          } else {
            setEmployees(prev => [...prev, data]);
            setMsg("تمت إضافة الموظف!");
          }
          setForm({
            name: "",
            phone: "",
            username: "",
            password: "",
            jobType: "",
            salaryType: "",
            salaryAmount: "",
            status: "فعال"
          });
          setEditId(null);
        } else {
          setMsg(data.error || "خطأ!");
        }
      });
  }

  function handleEdit(emp) {
    setEditId(emp._id);
    setForm({
      name: emp.name,
      phone: emp.phone || "",
      username: emp.username,
      password: "",
      jobType: emp.jobType,
      salaryType: emp.salaryType,
      salaryAmount: emp.salaryAmount,
      status: emp.status
    });
  }

  function handleDelete(id) {
    if (!window.confirm("تأكيد حذف الموظف؟")) return;
    fetch(`${BASE_URL}/api/employees/${id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(() => setEmployees(prev => prev.filter(e => e._id !== id)));
  }

  function handleCancelEdit() {
    setEditId(null);
    setForm({
      name: "",
      phone: "",
      username: "",
      password: "",
      jobType: "",
      salaryType: "",
      salaryAmount: "",
      status: "فعال"
    });
  }

  const inputStyle = {
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "15px",
    background: "#f8f9fa",
    color: "#222",
    fontFamily: "inherit",
    outline: "none"
  };

  const buttonStyle = {
    padding: "9px 24px",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid #2453c8",
    background: "#2453c8",
    color: "#fff",
    marginLeft: 8,
    transition: "background 0.2s, border 0.2s"
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    background: "#f3f4f6",
    color: "#222",
    border: "1px solid #d1d5db"
  };

  const editButtonStyle = {
    ...buttonStyle,
    background: "#fff",
    color: "#2453c8",
    border: "1px solid #2453c8",
    padding: "7px 15px"
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    background: "#fff",
    color: "#dc3545",
    border: "1px solid #dc3545",
    padding: "7px 15px"
  };

  return (
    <div style={{
      fontFamily: "'Cairo', Arial, sans-serif",
      direction: "rtl",
      background: "#f8f9fa",
      minHeight: "100vh",
      padding: 0
    }}>
      {/* Header */}
      <div style={{
        background: "#fff",
        borderBottom: "1.5px solid #e5e7eb",
        padding: "28px 0 18px 0",
        marginBottom: "35px",
        textAlign: "center"
      }}>
        <h2 style={{
          color: "#1a202c",
          fontSize: "25px",
          fontWeight: 800,
          letterSpacing: 0,
          margin: 0
        }}>
          إدارة الموظفين
        </h2>
      </div>

      <div style={{ padding: "0 24px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Form Card */}
        <div style={{
          background: "#fff",
          borderRadius: "8px",
          padding: "26px 22px 16px 22px",
          marginBottom: "32px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 6px rgba(20,30,60,0.04)"
        }}>
          <h3 style={{
            color: "#2453c8",
            marginBottom: "16px",
            fontSize: "17px",
            fontWeight: 700,
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "5px",
            letterSpacing: 0
          }}>
            {editId ? "تعديل موظف" : "إضافة موظف جديد"}
          </h3>

          <form onSubmit={handleAddOrEditEmployee}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "18px 13px",
              marginBottom: "8px"
            }}>
              <FormField label="اسم الموظف">
                <input
                  placeholder="أدخل اسم الموظف"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  style={{ ...inputStyle, width: "100%" }}
                />
              </FormField>

              <FormField label="رقم الجوال">
                <input
                  placeholder="مثال: 9665xxxxxxx"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))}
                  required
                  minLength={12}
                  maxLength={12}
                  style={{ ...inputStyle, width: "100%" }}
                />
              </FormField>

              <FormField label="اسم المستخدم">
                <input
                  placeholder="أدخل اسم المستخدم"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  required
                  style={{ ...inputStyle, width: "100%" }}
                />
              </FormField>

              <FormField label="كلمة المرور">
                <input
                  placeholder="أدخل كلمة المرور"
                  value={form.password}
                  type="password"
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required={!editId}
                  style={{ ...inputStyle, width: "100%" }}
                />
                {editId && (
                  <div style={{
                    fontSize: "11px",
                    color: "#7b8794",
                    marginTop: "3px"
                  }}>
                    اتركها فارغة إذا لا تريد تغيير كلمة المرور
                  </div>
                )}
              </FormField>

              <FormField label="نوع الوظيفة">
                <input
                  list="jobTypes"
                  placeholder="اختر نوع الوظيفة"
                  value={form.jobType}
                  onChange={e => setForm(f => ({ ...f, jobType: e.target.value }))}
                  required
                  style={{ ...inputStyle, width: "100%" }}
                />
                <datalist id="jobTypes">
                  {jobTypes.map((type, i) => (
                    <option key={i} value={type} />
                  ))}
                </datalist>
              </FormField>

              <FormField label="طريقة الدفع">
                <select
                  value={form.salaryType}
                  onChange={e => setForm(f => ({ ...f, salaryType: e.target.value }))}
                  required
                  style={{ ...inputStyle, width: "100%" }}
                >
                  <option value="">اختر طريقة الدفع</option>
                  <option value="راتب">راتب شهري</option>
                  <option value="قطعة">دفع بالقطعة</option>
                </select>
              </FormField>

              <FormField label="قيمة الراتب/القطعة">
                <input
                  placeholder="أدخل القيمة"
                  value={form.salaryAmount}
                  type="number"
                  onChange={e => setForm(f => ({ ...f, salaryAmount: e.target.value }))}
                  required
                  style={{ ...inputStyle, width: "100%" }}
                />
              </FormField>

              <FormField label="حالة الموظف">
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  style={{ ...inputStyle, width: "100%" }}
                >
                  <option value="فعال">فعال</option>
                  <option value="موقوف">موقوف</option>
                </select>
              </FormField>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "start", marginTop: 6 }}>
              <button type="submit" style={buttonStyle}>
                {editId ? "حفظ التعديل" : "إضافة موظف"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={cancelButtonStyle}
                >
                  إلغاء التعديل
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Success/Error Message */}
        {msg && (
          <div style={{
            padding: "11px 15px",
            borderRadius: "6px",
            marginBottom: "21px",
            textAlign: "center",
            fontWeight: 600,
            background: msg.includes("تم") ? "#e8f5e9" : "#fff0f0",
            color: msg.includes("تم") ? "#15803d" : "#dc3545",
            border: `1px solid ${msg.includes("تم") ? "#c3e6cb" : "#f5c6cb"}`
          }}>
            {msg}
          </div>
        )}

        {/* Employees Table */}
        <div style={{
          background: "#fff",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 6px rgba(20,30,60,0.04)"
        }}>
          <div style={{
            background: "#f7f8fa",
            padding: "13px 22px",
            color: "#1a202c",
            borderBottom: "1px solid #e5e7eb"
          }}>
            <h3 style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 700
            }}>
              قائمة الموظفين ({employees.length})
            </h3>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "15px"
            }}>
              <thead>
                <tr style={{ background: "#f7f8fa" }}>
                  <th style={thStyle}>الاسم</th>
                  <th style={thStyle}>رقم الجوال</th>
                  <th style={thStyle}>اسم المستخدم</th>
                  <th style={thStyle}>الوظيفة</th>
                  <th style={thStyle}>طريقة الدفع</th>
                  <th style={thStyle}>القيمة</th>
                  <th style={thStyle}>الحالة</th>
                  <th style={thStyle}>العمليات</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, index) => (
                  <tr key={emp._id}
                    style={{
                      background: index % 2 === 0 ? "#fff" : "#f8f9fa",
                      borderBottom: "1px solid #e5e7eb"
                    }}
                  >
                    <td style={tdStyle}>{emp.name}</td>
                    <td style={tdStyle}>{emp.phone || "-"}</td>
                    <td style={tdStyle}>{emp.username}</td>
                    <td style={tdStyle}>{emp.jobType}</td>
                    <td style={tdStyle}>{emp.salaryType}</td>
                    <td style={{ ...tdStyle, color: "#15803d", fontWeight: 600 }}>{emp.salaryAmount} ريال</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: "inline-block",
                        minWidth: 56,
                        textAlign: "center",
                        borderRadius: 4,
                        fontWeight: 600,
                        fontSize: 13,
                        padding: "3px 8px",
                        background: emp.status === "فعال" ? "#e8f5e9" : "#fff0f0",
                        color: emp.status === "فعال" ? "#15803d" : "#dc3545"
                      }}>
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, minWidth: 122 }}>
                      <button
                        onClick={() => handleEdit(emp)}
                        style={editButtonStyle}
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(emp._id)}
                        style={deleteButtonStyle}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {employees.length === 0 && (
            <div style={{
              padding: "35px",
              textAlign: "center",
              color: "#7b8794"
            }}>
              <h3 style={{ color: "#2453c8", marginBottom: "10px", fontWeight: 600, fontSize: 17 }}>لا يوجد موظفين</h3>
              <p style={{ fontSize: 14, marginTop: 0 }}>قم بإضافة موظف جديد لبدء الإدارة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== Table Styles ==========
const thStyle = {
  padding: "11px",
  textAlign: "center",
  borderBottom: "1px solid #e5e7eb",
  fontWeight: 700,
  color: "#1a202c",
  fontSize: 15
};
const tdStyle = {
  padding: "11px",
  textAlign: "center",
  borderBottom: "1px solid #e5e7eb",
  fontWeight: 500,
  color: "#222"
};
