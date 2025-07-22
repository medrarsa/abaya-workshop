import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
const BASE_URL = process.env.REACT_APP_API_URL;

const EMPTY_MODEL = {
  code: "",
  name: "",
  fabricType: "",
  imageUrl: "",
  metersNeeded: "",
  cutPrice: "",
  sewPrice: "",
  ironPrice: "",
  embPrice: "",
  buttonPrice: "",
  shipping: "",
};

const fields = [
  { key: "code", label: "رقم الموديل" },
  { key: "name", label: "اسم الموديل" },
  { key: "fabricType", label: "نوع القماش" },
  { key: "imageUrl", label: "رابط الصورة" },
  { key: "metersNeeded", label: "ياخذ" },
  { key: "cutPrice", label: "سعر القص" },
  { key: "sewPrice", label: "سعر الخياطة" },
  { key: "ironPrice", label: "سعر الكواية" },
  { key: "embPrice", label: "سعر التطريز" },
  { key: "buttonPrice", label: "سعر الأزرار" },
  { key: "shipping", label: "الشحن" },
];

// بوب أب إشعارات/تأكيد/حذف (كلاسيكي صغير)
function PopUpAlert({ show, type = "info", title, children, onClose, onConfirm, confirmLabel, cancelLabel }) {
  if (!show) return null;
  let color = "#2563eb";
  if (type === "success") color = "#19ad5b";
  if (type === "error") color = "#d44";
  if (type === "warning") color = "#f59e42";

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.22)", zIndex: 9999, display: "flex",
        alignItems: "center", justifyContent: "center"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: 13, minWidth: 320, maxWidth: 460,
          boxShadow: "0 6px 40px #0003", padding: 0, display: "flex",
          flexDirection: "column", overflow: "hidden"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: "22px 32px 15px 32px",
          borderBottom: "1px solid #eee",
          color, fontWeight: 900, fontSize: 22, textAlign: "center"
        }}>
          {title}
        </div>
        <div style={{
          padding: "12px 32px 18px 32px",
          fontSize: 17,
          textAlign: "center",
        }}>
          {children}
        </div>
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          {onConfirm ? (
            <>
              <button onClick={onConfirm} style={{
                margin: "0 10px",
                padding: "7px 32px",
                background: "#d61f3c",
                color: "#fff",
                border: "none",
                borderRadius: 9,
                fontWeight: 700,
                fontSize: 16
              }}>{confirmLabel || "تأكيد"}</button>
              <button onClick={onClose} style={{
                margin: "0 10px",
                padding: "7px 32px",
                background: "#eee",
                border: "none",
                borderRadius: 9,
                fontWeight: 700,
                fontSize: 16
              }}>{cancelLabel || "إلغاء"}</button>
            </>
          ) : (
            <button onClick={onClose} style={{
              padding: "7px 44px", background: "#eee", border: "none",
              borderRadius: 9, fontWeight: 700, fontSize: 16
            }}>إغلاق</button>
          )}
        </div>
      </div>
    </div>
  );
}

// بوب أب جدولي فخم للعرض المؤقت
function PopupTableModal({ show, title, children, onClose, maxWidth = 1100, maxHeight = 620 }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(30,40,80,0.20)",
        backdropFilter: "blur(2.5px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center"
      }}
      onClick={onClose}
    >
      <div
        style={{
          margin: "64px 0 32px 0",
          background: "#f8fbff",
          borderRadius: 18,
          boxShadow: "0 8px 38px #0002",
          width: "95vw", maxWidth,
          minHeight: 180, minWidth: 350,
          display: "flex", flexDirection: "column", overflow: "hidden", border: "1.7px solid #e3e7ef"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: "24px 32px 0 32px",
          fontWeight: 900,
          fontSize: 25,
          color: "#2563eb",
          textAlign: "right"
        }}>
          {title}
        </div>
        <div style={{
          padding: "0 32px 16px 32px", fontWeight: 400, fontSize: 17, color: "#666"
        }}>
          {children}
        </div>
        <div style={{
          borderTop: "1.7px solid #e3e7ef",
          padding: 18,
          textAlign: "center",
          background: "#eef3fa"
        }}>
          <button onClick={onClose} style={{
            padding: "9px 56px", background: "#eee", border: "none",
            borderRadius: 11, fontWeight: 900, fontSize: 17, letterSpacing: 1.1
          }}>إغلاق العرض المؤقت</button>
        </div>
      </div>
    </div>
  );
}

function ModelsTableWithExcelPopUp() {
  const [models, setModels] = useState([]);
  const [search, setSearch] = useState("");
  const [editIdx, setEditIdx] = useState(null);
  const [editModel, setEditModel] = useState({});
  const [addModel, setAddModel] = useState(EMPTY_MODEL);

  const [tempModels, setTempModels] = useState([]); // المؤقتة من الإكسل فقط
  const [showTableModal, setShowTableModal] = useState(false);

  // إشعار: {show, type, message}
  const [alert, setAlert] = useState({ show: false, type: "info", message: "" });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, idx: null });

  useEffect(() => {
    fetch(`${BASE_URL}/api/abayamodels`)
      .then(res => res.json())
      .then(res => setModels(Array.isArray(res.models) ? res.models : []))
      .catch(() => setModels([]));
  }, []);

  // رفع ملف إكسل
  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const headers = rows[0] || [];
      const newModels = rows.slice(1).map(row => {
        let obj = { ...EMPTY_MODEL };
        headers.forEach((h, i) => {
          if (h === "رقم الموديل") obj.code = row[i];
          else if (h === "اسم الموديل") obj.name = row[i];
          else if (h === "نوع القماش") obj.fabricType = row[i];
          else if (h === "رابط صورة الموديل") obj.imageUrl = row[i];
          else if (h === "ياخذ") obj.metersNeeded = row[i];
          else if (h === "سعر القص") obj.cutPrice = row[i];
          else if (h === "سعر الخياطة") obj.sewPrice = row[i];
          else if (h === "سعر الكواية") obj.ironPrice = row[i];
          else if (h === "سعر التطريز") obj.embPrice = row[i];
          else if (h === "سعر الأزرار") obj.buttonPrice = row[i];
          else if (h === "الشحن") obj.shipping = row[i];
        });
        return obj;
      });
      setTempModels(newModels);
      setShowTableModal(true);
    };
    reader.readAsBinaryString(file);
  };

  const handleTempEdit = (idx, key, value) => {
    setTempModels(tempModels =>
      tempModels.map((m, i) => (i === idx ? { ...m, [key]: value } : m))
    );
  };

  const handleTempDelete = idx => {
    setTempModels(tempModels => tempModels.filter((_, i) => i !== idx));
  };

  const handleBulkUpload = async () => {
    if (!tempModels.length) return setAlert({ show: true, type: "error", message: "لا توجد موديلات جديدة للحفظ!" });
    const res = await fetch(`${BASE_URL}/api/abayamodels/bulk-upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ models: tempModels }),
    });
    const result = await res.json();
    if (result.error) setAlert({ show: true, type: "error", message: result.error });
    else {
      setShowTableModal(false);
      setModels(models => [...models, ...tempModels]);
      setTempModels([]);
      setAlert({ show: true, type: "success", message: "تم رفع جميع الموديلات من الإكسل بنجاح!" });
    }
  };

  const filtered = models.filter(
    m =>
      m && typeof m === "object" &&
      Object.values(m)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const handleEdit = idx => {
    setEditIdx(idx);
    setEditModel({ ...filtered[idx] });
  };

  const handleSave = async idx => {
    const id = filtered[idx]._id;
    const res = await fetch(`${BASE_URL}/api/abayamodels/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editModel),
    });
    const result = await res.json();
    if (result.error) setAlert({ show: true, type: "error", message: result.error });
    else {
      setModels(models =>
        models.map(m => (m._id === id ? { ...editModel, _id: id } : m))
      );
      setEditIdx(null);
      setAlert({ show: true, type: "success", message: "تم تعديل الموديل بنجاح!" });
    }
  };

  // بوب اب تأكيد حذف
  const handleDelete = idx => {
    setConfirmDelete({ show: true, idx });
  };

  // تأكيد حذف نهائي
  const confirmDeleteYes = async () => {
    const idx = confirmDelete.idx;
    const id = filtered[idx]._id;
    const res = await fetch(`${BASE_URL}/api/abayamodels/${id}`, { method: "DELETE" });
    const result = await res.json();
    if (result.error) setAlert({ show: true, type: "error", message: result.error });
    else {
      setModels(models => models.filter(m => m._id !== id));
      setAlert({ show: true, type: "success", message: "تم حذف الموديل بنجاح!" });
    }
    setConfirmDelete({ show: false, idx: null });
  };

  const handleAdd = async () => {
    if (!addModel.code || !addModel.name) {
      setAlert({ show: true, type: "error", message: "الرجاء إدخال رقم الموديل واسم الموديل!" });
      return;
    }
    const res = await fetch(`${BASE_URL}/api/abayamodels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addModel),
    });
    const result = await res.json();
    if (result.error) setAlert({ show: true, type: "error", message: result.error });
    else {
      setModels(models => [...models, result]);
      setAddModel(EMPTY_MODEL);
      setAlert({ show: true, type: "success", message: "تمت إضافة الموديل!" });
    }
  };

  return (
    <div style={{ padding: 32, fontFamily: "Tajawal, Arial, sans-serif" }}>
      <h2>جدول الموديلات + رفع من إكسل</h2>

      {/* بوب أب فخم مؤقت لجدول الإكسل */}
      <PopupTableModal show={showTableModal} title="استعراض الموديلات المؤقتة من ملف الإكسل" onClose={() => setShowTableModal(false)}>
        <div style={{ overflowX: "auto", maxHeight: 400, overflowY: "auto", borderRadius: 11, marginBottom: 10 }}>
          <table border="1" cellPadding={8} style={{
            minWidth: 1000, borderRadius: 11, background: "#f9fbff"
          }}>
            <thead>
              <tr>
                {fields.map(f => <th key={f.key}>{f.label}</th>)}
                <th>تعديل</th>
                <th>حذف</th>
              </tr>
            </thead>
            <tbody>
              {tempModels.map((model, idx) => (
                <tr key={idx}>
                  {fields.map(f => (
                    <td key={f.key}>
                      <input
                        value={model[f.key] || ""}
                        onChange={e => handleTempEdit(idx, f.key, e.target.value)}
                        style={{ width: 120, borderRadius: 7, padding: 4, border: "1px solid #ccc" }}
                      />
                    </td>
                  ))}
                  <td>—</td>
                  <td>
                    <button
                      onClick={() => handleTempDelete(idx)}
                      style={{
                        background: "#d44",
                        color: "#fff",
                        border: "none",
                        borderRadius: 7,
                        padding: "4px 12px"
                      }}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ color: "#aaa", fontSize: 14, marginTop: 7 }}>عدد الموديلات المؤقتة: {tempModels.length}</div>
        </div>
        <button
          onClick={handleBulkUpload}
          style={{
            background: "#19ad5b", color: "#fff", fontWeight: 700,
            border: "none", borderRadius: 9, padding: "13px 50px", fontSize: 18
          }}
        >حفظ كل الموديلات في قاعدة البيانات</button>
      </PopupTableModal>

      {/* بوب أب إشعار عام (نجاح/خطأ/تنبيه) */}
      <PopUpAlert
        show={alert.show}
        type={alert.type}
        title={alert.type === "error" ? "خطأ" : alert.type === "success" ? "نجاح" : "تنبيه"}
        onClose={() => setAlert(a => ({ ...a, show: false }))}
      >
        <div style={{
          fontWeight: 700,
          fontSize: 19,
          color: alert.type === "error" ? "#d33" : alert.type === "success" ? "#19ad5b" : "#f59e42"
        }}>
          {alert.message}
        </div>
      </PopUpAlert>

      {/* بوب أب تأكيد حذف */}
      <PopUpAlert
        show={confirmDelete.show}
        type="warning"
        title="تأكيد حذف الموديل"
        onClose={() => setConfirmDelete({ show: false, idx: null })}
        onConfirm={confirmDeleteYes}
        confirmLabel="نعم، احذف"
        cancelLabel="إلغاء"
      >
        <div style={{
          fontWeight: 700, fontSize: 19, marginBottom: 10, color: "#d44"
        }}>هل أنت متأكد أنك تريد حذف هذا الموديل؟ لا يمكن التراجع بعد الحذف.</div>
      </PopUpAlert>

      {/* رفع إكسل */}
      <div style={{ marginBottom: 18 }}>
        <input type="file" accept=".xlsx, .xls" onChange={handleFile} />
        <span style={{ color: "#aaa", fontSize: 14, marginRight: 18 }}>
          أي موديل ترفعه من إكسل يظهر لك هنا مؤقتًا، لا يُرفع للسيرفر حتى تضغط حفظ!
        </span>
      </div>

      {/* إضافة موديل يدوي */}
      <div style={{
        background: "#f9f9f9", padding: 16, marginBottom: 18, borderRadius: 12, border: "1px solid #eee"
      }}>
        <b>إضافة موديل يدوي:</b>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 7 }}>
          {fields.map(f => (
            <input
              key={f.key}
              placeholder={f.label}
              value={addModel[f.key] || ""}
              onChange={e => setAddModel({ ...addModel, [f.key]: e.target.value })}
              style={{
                padding: "7px 10px",
                borderRadius: 8,
                border: "1px solid #aaa",
                width: 130,
                fontSize: 15,
              }}
            />
          ))}
          <button onClick={handleAdd} style={{
            background: "#218c6b",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            fontWeight: 700
          }}>
            إضافة
          </button>
        </div>
      </div>

      {/* البحث */}
      <div style={{ margin: "0 0 12px" }}>
        <input
          type="text"
          placeholder="بحث سريع..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: "8px 14px",
            borderRadius: 9,
            border: "1.5px solid #888",
            minWidth: 180,
            fontSize: 17,
            marginRight: 10
          }}
        />
      </div>
      {/* جدول الموديلات الأساسي */}
      <div style={{ overflowX: "auto", borderRadius: 12, marginBottom: 25 }}>
        <table border="1" cellPadding={8} style={{
          background: "#fff",
          minWidth: 900,
          borderRadius: 12,
          border: "1px solid #eee",
          boxShadow: "0 4px 16px #0001"
        }}>
          <thead style={{ background: "#fafafa" }}>
            <tr>
              {fields.map(f => (
                <th key={f.key}>{f.label}</th>
              ))}
              <th>تعديل</th>
              <th>حذف</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((model, idx) => (
              <tr key={idx + (model._id || "")}>
                {fields.map(f =>
                  editIdx === idx ? (
                    <td key={f.key}>
                      <input
                        value={editModel[f.key] ?? ""}
                        onChange={e =>
                          setEditModel({ ...editModel, [f.key]: e.target.value })
                        }
                        style={{ width: 120, borderRadius: 7, padding: 4, border: "1px solid #ccc" }}
                      />
                    </td>
                  ) : (
                    <td key={f.key}>{model[f.key]}</td>
                  )
                )}
                <td>
                  {model._id && (editIdx === idx ? (
                    <button onClick={() => handleSave(idx)} style={{ background: "#0a9d42", color: "#fff", border: "none", borderRadius: 7, padding: "4px 12px" }}>حفظ</button>
                  ) : (
                    <button onClick={() => handleEdit(idx)} style={{ background: "#eee", border: "none", borderRadius: 7, padding: "4px 12px" }}>تعديل</button>
                  ))}
                </td>
                <td>
                  {model._id ? (
                    <button
                      onClick={() => handleDelete(idx)}
                      style={{
                        background: "#d44",
                        color: "#fff",
                        border: "none",
                        borderRadius: 7,
                        padding: "4px 12px"
                      }}
                    >
                      حذف
                    </button>
                  ) : (
                    <span style={{ color: "#aaa" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ color: "#aaa", fontSize: 14, marginTop: 6 }}>
          عدد النتائج: {filtered.length}
        </div>
      </div>
    </div>
  );
}
 
export default ModelsTableWithExcelPopUp;
