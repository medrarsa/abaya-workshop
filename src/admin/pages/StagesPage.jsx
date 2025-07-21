import React, { useState, useEffect } from "react";
const BASE_URL = process.env.REACT_APP_API_URL;
export default function StagesPage() {
  const [stages, setStages] = useState([]);
  const [form, setForm] = useState({ name: "", order: "", jobType: "" });
  const [msg, setMsg] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/stages`)
      .then(res => res.json())
      .then(setStages);
  }, []);

  function handleAddOrEditStage(e) {
    e.preventDefault();
    setMsg("");
    if (editId) {
      // تعديل مرحلة
      fetch(`${BASE_URL}/api/stages/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order: Number(form.order) })
      })
        .then(res => res.json())
        .then(data => {
          setStages(prev =>
            prev.map(s => (s._id === editId ? data : s)).sort((a, b) => a.order - b.order)
          );
          setEditId(null);
          setForm({ name: "", order: "", jobType: "" });
          setMsg("تم التعديل!");
        });
    } else {
      // إضافة مرحلة
      fetch(`${BASE_URL}/api/stages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order: Number(form.order) })
      })
        .then(res => res.json())
        .then(data => {
          if (data._id) {
            setStages(prev => [...prev, data].sort((a, b) => a.order - b.order));
            setForm({ name: "", order: "", jobType: "" });
            setMsg("تمت إضافة المرحلة!");
          } else {
            setMsg(data.error || "خطأ!");
          }
        });
    }
  }

  function handleEdit(stage) {
    setEditId(stage._id);
    setForm({ name: stage.name, order: stage.order, jobType: stage.jobType });
  }

  function handleDelete(id) {
    if (!window.confirm("تأكيد حذف المرحلة؟")) return;
    fetch(`${BASE_URL}/api/stages/${id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(() => setStages(prev => prev.filter(s => s._id !== id)));
  }

  function handleCancelEdit() {
    setEditId(null);
    setForm({ name: "", order: "", jobType: "" });
  }

  const inputStyle = {
    padding: "12px 16px",
    border: "2px solid #e1e5e9",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "'Cairo', sans-serif",
    transition: "all 0.3s ease",
    outline: "none",
    backgroundColor: "#fff"
  };

  const buttonStyle = {
    padding: "12px 24px",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Cairo', sans-serif"
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    color: "#8b4513",
    boxShadow: "0 4px 15px rgba(252, 182, 159, 0.4)"
  };

  const editButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    color: "#2d3748",
    padding: "8px 16px",
    fontSize: "12px",
    marginLeft: "8px"
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    color: "#e53e3e",
    padding: "8px 16px",
    fontSize: "12px"
  };

  const getStageIcon = (order) => {
    const icons = ["🎯", "✂️", "🧵", "🔥", "💎", "📦", "🚚", "✅"];
    return icons[order - 1] || "⚙️";
  };

  const getJobTypeColor = (jobType) => {
    const colors = {
      "قص": "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
      "خياط": "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      "كوي": "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      "تطريز": "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
      "تشطيب": "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
      "تغليف": "linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)"
    };
    return colors[jobType] || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  };

  return (
    <div style={{ 
      fontFamily: "'Cairo', sans-serif",
      direction: "rtl",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      minHeight: "100vh",
      padding: "0"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "30px",
        marginBottom: "30px",
        borderRadius: "0 0 25px 25px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{
          color: "#fff",
          margin: 0,
          fontSize: "28px",
          fontWeight: "700",
          textAlign: "center",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }}>
          ⚙️ إدارة مراحل العمل
        </h2>
        <p style={{
          color: "rgba(255,255,255,0.9)",
          textAlign: "center",
          margin: "10px 0 0 0",
          fontSize: "16px"
        }}>
          تنظيم وترتيب مراحل الإنتاج والعمليات
        </p>
      </div>

      <div style={{ padding: "0 30px" }}>
        {/* Form Card */}
        <div style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "30px",
          marginBottom: "30px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          border: "1px solid rgba(255,255,255,0.2)"
        }}>
          <h3 style={{
            color: "#2d3748",
            marginBottom: "25px",
            fontSize: "20px",
            fontWeight: "600",
            borderBottom: "3px solid #667eea",
            paddingBottom: "10px",
            display: "inline-block"
          }}>
            {editId ? "✏️ تعديل مرحلة" : "➕ إضافة مرحلة جديدة"}
          </h3>

          <form onSubmit={handleAddOrEditStage}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginBottom: "25px"
            }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "#4a5568", fontWeight: "600" }}>
                  🏷️ اسم المرحلة
                </label>
                <input
                  placeholder="مثل: قص، خياطة، كوي..."
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  style={{
                    ...inputStyle,
                    width: "100%"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "#4a5568", fontWeight: "600" }}>
                  🔢 رقم الترتيب
                </label>
                <input
                  placeholder="1, 2, 3..."
                  type="number"
                  value={form.order}
                  onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                  required
                  style={{
                    ...inputStyle,
                    width: "100%"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "#4a5568", fontWeight: "600" }}>
                  👨‍💼 نوع الوظيفة
                </label>
                <input
                  placeholder="مثل: قصاص، خياط، كواي..."
                  value={form.jobType}
                  onChange={e => setForm(f => ({ ...f, jobType: e.target.value }))}
                  required
                  style={{
                    ...inputStyle,
                    width: "100%"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
              <button 
                type="submit"
                style={primaryButtonStyle}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
                }}
              >
                {editId ? "💾 حفظ التعديل" : "➕ إضافة مرحلة"}
              </button>
              {editId && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  style={secondaryButtonStyle}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 25px rgba(252, 182, 159, 0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 15px rgba(252, 182, 159, 0.4)";
                  }}
                >
                  ❌ إلغاء التعديل
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Success/Error Message */}
        {msg && (
          <div style={{
            padding: "15px 20px",
            borderRadius: "10px",
            marginBottom: "25px",
            textAlign: "center",
            fontWeight: "600",
            background: msg.includes("تم") 
              ? "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)"
              : "linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)",
            color: msg.includes("تم") ? "#155724" : "#721c24",
            border: `2px solid ${msg.includes("تم") ? "#c3e6cb" : "#f5c6cb"}`,
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
          }}>
            {msg.includes("تم") ? "✅" : "❌"} {msg}
          </div>
        )}

        {/* Stages Table */}
        <div style={{
          background: "#fff",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          border: "1px solid rgba(255,255,255,0.2)"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "20px",
            color: "#fff"
          }}>
            <h3 style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "600"
            }}>
              📋 مراحل العمل المُعرَّفة ({stages.length})
            </h3>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ 
              width: "100%", 
              borderCollapse: "collapse",
              fontSize: "14px"
            }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #e9ecef", fontWeight: "600", color: "#495057" }}>🔢 الترتيب</th>
                  <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #e9ecef", fontWeight: "600", color: "#495057" }}>🏷️ اسم المرحلة</th>
                  <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #e9ecef", fontWeight: "600", color: "#495057" }}>👨‍💼 نوع الوظيفة</th>
                  <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #e9ecef", fontWeight: "600", color: "#495057" }}>⚙️ العمليات</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((stage, index) => (
                  <tr key={stage._id} style={{ 
                    background: index % 2 === 0 ? "#fff" : "#f8f9fa",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => e.target.parentElement.style.background = "#e3f2fd"}
                  onMouseLeave={(e) => e.target.parentElement.style.background = index % 2 === 0 ? "#fff" : "#f8f9fa"}
                  >
                    <td style={{ padding: "15px", textAlign: "center", borderBottom: "1px solid #e9ecef" }}>
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "16px"
                      }}>
                        {stage.order}
                      </div>
                    </td>
                    <td style={{ padding: "15px", textAlign: "center", borderBottom: "1px solid #e9ecef" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                        <span style={{ fontSize: "20px" }}>{getStageIcon(stage.order)}</span>
                        <span style={{ fontWeight: "600", color: "#2d3748" }}>{stage.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "15px", textAlign: "center", borderBottom: "1px solid #e9ecef" }}>
                      <span style={{
                        background: getJobTypeColor(stage.jobType),
                        color: "#2d3748",
                        padding: "8px 16px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                      }}>
                        {stage.jobType}
                      </span>
                    </td>
                    <td style={{ padding: "15px", textAlign: "center", borderBottom: "1px solid #e9ecef" }}>
                      <button 
                        onClick={() => handleEdit(stage)}
                        style={editButtonStyle}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "0 4px 15px rgba(168, 237, 234, 0.6)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        ✏️ تعديل
                      </button>
                      <button 
                        onClick={() => handleDelete(stage._id)}
                        style={deleteButtonStyle}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "0 4px 15px rgba(255, 154, 158, 0.6)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "none";
                        }}
                      >
                        🗑️ حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {stages.length === 0 && (
            <div style={{
              padding: "60px",
              textAlign: "center",
              color: "#718096"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚙️</div>
              <h3 style={{ color: "#4a5568", marginBottom: "10px" }}>لا توجد مراحل مُعرَّفة</h3>
              <p>قم بإضافة مرحلة جديدة لبدء تنظيم سير العمل</p>
            </div>
          )}
        </div>

        {/* Workflow Preview */}
        {stages.length > 0 && (
          <div style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "30px",
            marginTop: "30px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            border: "1px solid rgba(255,255,255,0.2)"
          }}>
            <h3 style={{
              color: "#2d3748",
              marginBottom: "25px",
              fontSize: "20px",
              fontWeight: "600",
              textAlign: "center"
            }}>
              🔄 معاينة سير العمل
            </h3>
            
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "15px"
            }}>
              {stages.sort((a, b) => a.order - b.order).map((stage, index) => (
                <React.Fragment key={stage._id}>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "15px",
                    background: getJobTypeColor(stage.jobType),
                    borderRadius: "15px",
                    minWidth: "120px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                  }}>
                    <div style={{
                      fontSize: "24px",
                      marginBottom: "8px"
                    }}>
                      {getStageIcon(stage.order)}
                    </div>
                    <div style={{
                      fontWeight: "600",
                      color: "#2d3748",
                      fontSize: "14px",
                      textAlign: "center"
                    }}>
                      {stage.name}
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: "#4a5568",
                      marginTop: "4px"
                    }}>
                      {stage.jobType}
                    </div>
                  </div>
                  
                  {index < stages.length - 1 && (
                    <div style={{
                      fontSize: "20px",
                      color: "#667eea"
                    }}>
                      ➡️
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
