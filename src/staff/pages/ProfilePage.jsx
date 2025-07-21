import React, { useEffect, useState } from "react";
const BASE_URL = process.env.REACT_APP_API_URL;
export default function ProfilePage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // جلب بيانات الموظف
  useEffect(() => {
    if (!user._id) return;
    fetch(`${BASE_URL}/api/employees/summary/list`)
      .then(res => res.json())
      .then(list => {
        const data = list.find(emp => emp._id === user._id);
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user._id, edit]);

  // تهيئة الفورم عند بدء التعديل
  useEffect(() => {
    if (profile && edit) {
      setForm({
        name: profile.name || "",
        phone: profile.phone || "",
        password: ""
      });
    }
  }, [profile, edit]);

  // حفظ التعديلات
  const handleSave = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!/^9665\d{8}$/.test(form.phone)) {
      setMsg("رقم الجوال يجب أن يبدأ بـ9665 ويحتوي على 12 رقم.");
      return;
    }

    let updateOK = true;

    // حفظ الاسم والجوال أولاً
    const res = await fetch(`${BASE_URL}/api/employees/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, phone: form.phone }),
    });
    const data = await res.json();

    if (!data._id) {
      setMsg(data.error || "حدث خطأ أثناء تحديث الاسم/الجوال");
      updateOK = false;
    } else {
      setProfile({ ...profile, name: form.name, phone: form.phone });
      localStorage.setItem("user", JSON.stringify({ ...user, name: form.name, phone: form.phone }));
    }

    // إذا الموظف كتب كلمة مرور جديدة — أرسلها لمسار منفصل
    if (form.password && form.password.length >= 4) {
      const passRes = await fetch(`${BASE_URL}/api/employees/${user._id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.password }),
      });
      const passData = await passRes.json();
      if (!passData.success) {
        setMsg(passData.error || "فشل تحديث كلمة المرور");
        updateOK = false;
      }
    }

    if (updateOK) {
      setMsg("تم تحديث البيانات بنجاح!");
      setTimeout(() => {
        setMsg("");
        setEdit(false);
      }, 1200);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>جاري التحميل...</div>;
  if (!profile) return <div style={{ padding: 40, textAlign: "center", color: "#e74c3c" }}>لم يتم العثور على بياناتك</div>;

  let createdAtStr = "-";
  try {
    if (profile.createdAt) {
      const dateObj = new Date(profile.createdAt);
      if (!isNaN(dateObj.getTime())) {
        createdAtStr = dateObj.toLocaleDateString("ar-SA");
      }
    }
  } catch {}

  return (
    <div style={{
      maxWidth: 410, margin: "50px auto", background: "#fff", borderRadius: 13,
      boxShadow: "0 2px 16px #eef1f8", padding: "38px 30px", direction: "rtl"
    }}>
      <h2 style={{ textAlign: "center", fontWeight: 900, marginBottom: 30 }}>
        الملف الشخصي للموظف
      </h2>

      {edit ? (
        <form onSubmit={handleSave}>
          <EditField label="الاسم">
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required style={inputStyle}
              placeholder="ادخل اسمك"
            />
          </EditField>
          <EditField label="رقم الجوال السعودي">
            <input
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "") }))}
              required maxLength={12} minLength={12}
              style={inputStyle}
              placeholder="مثال: 9665xxxxxxxx"
            />
            <div style={{ fontSize: 13, color: "#888", marginTop: 5 }}>
              يجب أن يبدأ بـ9665 ويكون 12 رقم فقط
            </div>
          </EditField>
          <EditField label="كلمة المرور الجديدة (اختياري)">
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              style={inputStyle}
              placeholder="اكتب كلمة مرور جديدة أو اتركها فارغة"
              minLength={4}
            />
            <div style={{ fontSize: 12.5, color: "#888", marginTop: 3 }}>
              كلمة المرور الجديدة سيتم تشفيرها تلقائيًا (لا تظهر لأحد)
            </div>
          </EditField>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button
              type="submit"
              style={{
                flex: 1, padding: "13px", background: "#2453c8", color: "#fff", fontWeight: 900,
                fontSize: 17, border: "none", borderRadius: 8
              }}
              disabled={loading}
            >حفظ</button>
            <button
              type="button"
              style={{
                flex: 1, padding: "13px", background: "#fff", color: "#2453c8", fontWeight: 900,
                fontSize: 17, border: "1.5px solid #2453c8", borderRadius: 8
              }}
              onClick={() => { setEdit(false); setMsg(""); }}
            >إلغاء</button>
          </div>
          {msg && (
            <div style={{
              marginTop: 22, color: msg.includes("تم") ? "#27ae60" : "#e74c3c",
              fontWeight: 700, textAlign: "center", fontSize: 16
            }}>
              {msg}
            </div>
          )}
        </form>
      ) : (
        <>
          <ProfileRow label="الاسم" value={profile.name || "-"} />
          <ProfileRow label="رقم الجوال" value={profile.phone || "-"} />
          <ProfileRow label="اسم المستخدم" value={profile.username || "-"} />
          <ProfileRow label="نوع الوظيفة" value={profile.jobType || "-"} />
          <ProfileRow label="طريقة الدفع" value={profile.salaryType || "-"} />
          <ProfileRow label="الأجر/الراتب" value={
            (profile.salaryAmount ?? "-") +
            (profile.salaryType === "قطعة" ? " ريال/قطعة" : (profile.salaryType === "راتب" ? " ريال/شهر" : ""))
          } />
          <ProfileRow label="الحالة" value={profile.status || "-"} color={profile.status === "فعال" ? "#27ae60" : "#e74c3c"} />
          <ProfileRow label="تاريخ الإنشاء" value={createdAtStr} />
          <button
            style={{
              width: "100%", marginTop: 35, padding: "12px", fontWeight: 900, fontSize: 17,
              background: "#2453c8", color: "#fff", border: "none", borderRadius: 8, letterSpacing: 1.1
            }}
            onClick={() => setEdit(true)}
          >
            تعديل البيانات
          </button>
        </>
      )}
    </div>
  );
}

function ProfileRow({ label, value, color }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      borderBottom: "1px solid #f0f0f0", padding: "12px 0", fontSize: 17
    }}>
      <span style={{ color: "#555", fontWeight: 700 }}>{label}</span>
      <span style={{
        fontWeight: 800, color: color || "#222", letterSpacing: 0.7
      }}>{value}</span>
    </div>
  );
}

function EditField({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: "block", marginBottom: "7px", fontWeight: 700, color: "#333", fontSize: 15.5
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 11px",
  borderRadius: 7,
  border: "1.3px solid #ccd3e1",
  fontSize: 16.7,
  fontWeight: 700,
  background: "#f8f9fa",
  color: "#222"
};
