import React, { useState, useEffect } from "react";
const BASE_URL = process.env.REACT_APP_API_URL;
// ========== التبويب الأول: تقارير الحركات المالية ==========
function FinancialReportTab() {
  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("دفعة");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");
  const [empSearch, setEmpSearch] = useState("");

  const [reportEmployee, setReportEmployee] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);

  // التقسيم والبحث
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
 
  useEffect(() => {
    fetch(`${BASE_URL}/api/employees`)
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(() => setEmployees([]));
  }, []);

  // إضافة حركة مالية
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employee || !amount || !type) return setMsg("يجب تعبئة كل البيانات");
    setMsg("...جاري التنفيذ");
    try {
      const res = await fetch(`${BASE_URL}/api/payments/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee, amount: Number(amount), type, notes })
      });
      const data = await res.json();
      if (data.error) {
        setMsg("خطأ: " + data.error);
      } else {
        setMsg("✅ تم إضافة الحركة المالية بنجاح");
        if (report.length > 0) fetchReport();
        setEmployee("");
        setAmount("");
        setNotes("");
        setTimeout(() => setMsg(""), 3000);
      }
    } catch (error) {
      setMsg("خطأ في الاتصال بالخادم");
    }
  };

  // جلب تقرير الحركات
  const fetchReport = async () => {
    setLoading(true);
    try {
      let url =`${BASE_URL}/api/payments/report?`;
      if (reportEmployee) url += `employee=${reportEmployee}&`;
      if (start) url += `start=${start}&`;
      if (end) url += `end=${end}&`;
      const res = await fetch(url);
      const data = await res.json();
      setReport(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (error) {
      setReport([]);
    }
    setLoading(false);
  };

  // تصفية التقرير حسب البحث
  const filteredReport = report.filter(p => 
    !searchTerm || 
    p.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type.includes(searchTerm) ||
    p.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.amount?.toString().includes(searchTerm)
  );

  // تقسيم الصفحات
  const totalPages = Math.ceil(filteredReport.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredReport.slice(startIndex, startIndex + itemsPerPage);

  // إجماليات التقرير
  let due = 0, paid = 0, loan = 0, discount = 0;
  filteredReport.forEach(p => {
    if (p.type === "مستحق") due += p.amount;
    if (p.type === "دفعة") paid += p.amount;
    if (p.type === "سلفة") loan += p.amount;
    if (p.type === "خصم") discount += p.amount;
  });

  const finalBalance = due - paid - loan - discount;

  const filteredEmployees = empSearch.trim()
    ? employees.filter(emp =>
        emp.name?.includes(empSearch) ||
        emp.username?.includes(empSearch)
      )
    : employees;

  // دالة الطباعة
  const handlePrint = () => {
    const printContent = document.getElementById('printable-content');
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "2px solid #e1e5e9",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "'Cairo', sans-serif",
    transition: "all 0.3s ease",
    outline: "none"
  };

  const buttonStyle = {
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontFamily: "'Cairo', sans-serif"
  };

  return (
    <div style={{ fontFamily: "'Cairo', sans-serif", direction: "rtl" }}>
      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "25px" }}>
        {/* نموذج إضافة حركة مالية */}
        <div style={{
          background: "#f8f9fa",
          borderRadius: "15px",
          padding: "20px",
          border: "2px solid #e9ecef",
          height: "fit-content"
        }}>
          <h3 style={{
            textAlign: "center",
            color: "#2c3e50",
            marginBottom: "20px",
            fontSize: "18px",
            fontWeight: "700"
          }}>
            ➕ إضافة حركة مالية
          </h3>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#495057" }}>
                🔍 بحث الموظف
              </label>
              <input
                type="text"
                placeholder="بحث بالاسم أو اسم المستخدم"
                value={empSearch}
                onChange={e => setEmpSearch(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#495057" }}>
                👤 الموظف *
              </label>
              <select 
                value={employee} 
                onChange={e => setEmployee(e.target.value)} 
                style={inputStyle}
                required
              >
                <option value="">اختر موظف</option>
                {filteredEmployees.map(emp => (
                  <option key={emp._id || emp.id} value={emp._id || emp.id}>
                    {emp.name} ({emp.username})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#495057" }}>
                💵 المبلغ *
              </label>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                style={inputStyle}
                required 
                min={1}
                placeholder="أدخل المبلغ"
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#495057" }}>
                📋 نوع الحركة *
              </label>
              <select 
                value={type} 
                onChange={e => setType(e.target.value)} 
                style={inputStyle}
              >
                <option value="دفعة">💳 دفعة</option>
                <option value="سلفة">💸 سلفة</option>
                <option value="خصم">➖ خصم</option>
                <option value="مستحق">💰 مستحق (مكافأة/حافز)</option>
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#495057" }}>
                📝 ملاحظة
              </label>
              <input 
                type="text" 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                style={inputStyle}
                placeholder="ملاحظة اختيارية"
              />
            </div>

            <button 
              type="submit" 
              style={{
                ...buttonStyle,
                width: "100%",
                background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                color: "#fff",
                fontWeight: "700",
                fontSize: "16px"
              }}
            >
              💾 حفظ الحركة
            </button>

            {msg && (
              <div style={{
                marginTop: "15px",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
                fontWeight: "600",
                background: msg.includes("خطأ") ? "#f8d7da" : "#d4edda",
                color: msg.includes("خطأ") ? "#721c24" : "#155724",
                border: `1px solid ${msg.includes("خطأ") ? "#f5c6cb" : "#c3e6cb"}`
              }}>
                {msg}
              </div>
            )}
          </form>
        </div>

        {/* قسم التقرير */}
        <div style={{
          background: "#fff",
          borderRadius: "15px",
          padding: "20px",
          border: "2px solid #e9ecef"
        }}>
          <h3 style={{
            color: "#2c3e50",
            marginBottom: "20px",
            fontSize: "18px",
            fontWeight: "700"
          }}>
            📊 تقرير الحركات المالية
          </h3>

          {/* فلاتر البحث */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto auto",
            gap: "12px",
            marginBottom: "20px",
            alignItems: "end"
          }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "600" }}>
                👤 الموظف
              </label>
              <select 
                value={reportEmployee} 
                onChange={e => setReportEmployee(e.target.value)}
                style={{ ...inputStyle, fontSize: "13px", padding: "8px 10px" }}
              >
                <option value="">كل الموظفين</option>
                {employees.map(emp => (
                  <option key={emp._id || emp.id} value={emp._id || emp.id}>
                    {emp.name} ({emp.username})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "600" }}>
                📅 من تاريخ
              </label>
              <input 
                type="date" 
                value={start} 
                onChange={e => setStart(e.target.value)} 
                style={{ ...inputStyle, fontSize: "13px", padding: "8px 10px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: "600" }}>
                📅 إلى تاريخ
              </label>
              <input 
                type="date" 
                value={end} 
                onChange={e => setEnd(e.target.value)} 
                style={{ ...inputStyle, fontSize: "13px", padding: "8px 10px" }}
              />
            </div>

            <button 
              onClick={fetchReport} 
              style={{
                ...buttonStyle,
                background: "#28a745",
                color: "#fff",
                padding: "8px 16px"
              }}
            >
              📊 عرض
            </button>

            <button 
              onClick={handlePrint} 
              disabled={report.length === 0}
              style={{
                ...buttonStyle,
                background: report.length === 0 ? "#6c757d" : "#007bff",
                color: "#fff",
                cursor: report.length === 0 ? "not-allowed" : "pointer",
                padding: "8px 16px"
              }}
            >
              🖨️ طباعة
            </button>
          </div>

          {/* بحث في التقرير */}
          {report.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="بحث في التقرير (الموظف، النوع، الملاحظة، المبلغ)..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ ...inputStyle, maxWidth: "400px" }}
              />
            </div>
          )}

          {/* الإجماليات */}
          {report.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))",
              gap: "12px",
              marginBottom: "20px",
              padding: "15px",
              background: "#f8f9fa",
              borderRadius: "10px",
              border: "2px solid #e9ecef"
            }}>
              <div style={{
                background: "#d4edda",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
                border: "1px solid #c3e6cb"
              }}>
                <div style={{ fontSize: "16px", color: "#155724", fontWeight: "600" }}>المستحقات</div>
                <div style={{ fontSize: "18px", color: "#155724", fontWeight: "800" }}>
                  {due.toLocaleString()}
                </div>
              </div>

              <div style={{
                background: "#cce5ff",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
                border: "1px solid #b3d9ff"
              }}>
                <div style={{ fontSize: "16px", color: "#004085", fontWeight: "600" }}>الدفعات</div>
                <div style={{ fontSize: "18px", color: "#004085", fontWeight: "800" }}>
                  {paid.toLocaleString()}
                </div>
              </div>

              <div style={{
                background: "#fff3cd",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
                border: "1px solid #ffeaa7"
              }}>
                <div style={{ fontSize: "16px", color: "#856404", fontWeight: "600" }}>السلف</div>
                <div style={{ fontSize: "18px", color: "#856404", fontWeight: "800" }}>
                  {loan.toLocaleString()}
                </div>
              </div>

              <div style={{
                background: "#f8d7da",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
                border: "1px solid #f5c6cb"
              }}>
                <div style={{ fontSize: "16px", color: "#721c24", fontWeight: "600" }}>الخصومات</div>
                <div style={{ fontSize: "18px", color: "#721c24", fontWeight: "800" }}>
                  {discount.toLocaleString()}
                </div>
              </div>

              <div style={{
                background: finalBalance >= 0 ? "#d4edda" : "#f8d7da",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
                border: `1px solid ${finalBalance >= 0 ? "#c3e6cb" : "#f5c6cb"}`,
                gridColumn: "span 1"
              }}>
                <div style={{ 
                  fontSize: "16px", 
                  color: finalBalance >= 0 ? "#155724" : "#721c24",
                  fontWeight: "600"
                }}>
                  الرصيد النهائي
                </div>
                <div style={{ 
                  fontSize: "20px", 
                  color: finalBalance >= 0 ? "#155724" : "#721c24", 
                  fontWeight: "900" 
                }}>
                  {finalBalance.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* جدول التقرير */}
          <div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
                ⏳ جاري تحميل التقرير...
              </div>
            ) : report.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
                <div style={{ fontSize: "48px", marginBottom: "10px" }}>📊</div>
                <div style={{ fontSize: "18px", fontWeight: "600" }}>لا يوجد بيانات للعرض</div>
                <div style={{ fontSize: "14px", marginTop: "5px" }}>قم بتحديد المعايير واضغط "عرض التقرير"</div>
              </div>
            ) : (
              <>
                <div style={{ 
                  overflowX: "auto",
                  border: "2px solid #dee2e6",
                  borderRadius: "10px"
                }}>
                  <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                    background: "#fff"
                  }}>
                    <thead>
                      <tr style={{ background: "#f8f9fa" }}>
                        <th style={{ 
                          padding: "15px 12px", 
                          textAlign: "right", 
                          fontWeight: "700",
                          color: "#495057",
                          borderBottom: "2px solid #dee2e6"
                        }}>
                          التاريخ
                        </th>
                        <th style={{ 
                          padding: "15px 12px", 
                          textAlign: "right", 
                          fontWeight: "700",
                          color: "#495057",
                          borderBottom: "2px solid #dee2e6"
                        }}>
                          الموظف
                        </th>
                        <th style={{ 
                          padding: "15px 12px", 
                          textAlign: "center", 
                          fontWeight: "700",
                          color: "#495057",
                          borderBottom: "2px solid #dee2e6"
                        }}>
                          النوع
                        </th>
                        <th style={{ 
                          padding: "15px 12px", 
                          textAlign: "center", 
                          fontWeight: "700",
                          color: "#495057",
                          borderBottom: "2px solid #dee2e6"
                        }}>
                          المبلغ
                        </th>
                        <th style={{ 
                          padding: "15px 12px", 
                          textAlign: "right", 
                          fontWeight: "700",
                          color: "#495057",
                          borderBottom: "2px solid #dee2e6"
                        }}>
                          ملاحظة
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((p, idx) => (
                        <tr key={idx} style={{ 
                          borderBottom: "1px solid #dee2e6",
                          background: idx % 2 === 0 ? "#fff" : "#f8f9fa"
                        }}>
                          <td style={{ padding: "12px", fontWeight: "500" }}>
                            {new Date(p.date).toLocaleDateString("ar-SA")}
                          </td>
                          <td style={{ padding: "12px", fontWeight: "600" }}>
                            {p.employee?.name || "-"}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <span style={{
                              padding: "4px 10px",
                              borderRadius: "15px",
                              fontSize: "11px",
                              fontWeight: "600",
                              background: p.type === "مستحق" ? "#d4edda" :
                                         p.type === "دفعة" ? "#cce5ff" :
                                         p.type === "سلفة" ? "#fff3cd" : "#f8d7da",
                              color: p.type === "مستحق" ? "#155724" :
                                    p.type === "دفعة" ? "#004085" :
                                    p.type === "سلفة" ? "#856404" : "#721c24"
                            }}>
                              {p.type}
                            </span>
                          </td>
                          <td style={{ 
                            padding: "12px", 
                            textAlign: "center",
                            fontWeight: "700",
                            color: p.type === "مستحق" ? "#28a745" :
                                  p.type === "دفعة" ? "#007bff" :
                                  p.type === "سلفة" ? "#ffc107" : "#dc3545"
                          }}>
                            {p.amount?.toLocaleString() || 0} ريال
                          </td>
                          <td style={{ 
                            padding: "12px", 
                            color: "#6c757d",
                            fontStyle: p.notes ? "normal" : "italic"
                          }}>
                            {p.notes || "لا توجد ملاحظة"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{
                    padding: "15px 0",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px"
                  }}>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      style={{
                        ...buttonStyle,
                        background: currentPage === 1 ? "#e9ecef" : "#007bff",
                        color: currentPage === 1 ? "#6c757d" : "#fff",
                        cursor: currentPage === 1 ? "not-allowed" : "pointer"
                      }}
                    >
                      السابق
                    </button>

                    <span style={{ fontSize: "14px", color: "#495057", fontWeight: "600" }}>
                      صفحة {currentPage} من {totalPages} ({filteredReport.length} سجل)
                    </span>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      style={{
                        ...buttonStyle,
                        background: currentPage === totalPages ? "#e9ecef" : "#007bff",
                        color: currentPage === totalPages ? "#6c757d" : "#fff",
                        cursor: currentPage === totalPages ? "not-allowed" : "pointer"
                      }}
                    >
                      التالي
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* محتوى الطباعة المخفي */}
      <div id="printable-content" style={{ display: "none" }}>
        <div style={{
          fontFamily: "'Cairo', Tahoma, Arial, sans-serif",
          direction: "rtl",
          padding: "20px",
          fontSize: "12px",
          lineHeight: "1.4"
        }}>
          {/* عنوان التقرير */}
          <div style={{
            textAlign: "center",
            marginBottom: "25px",
            borderBottom: "3px solid #333",
            paddingBottom: "15px"
          }}>
            <h1 style={{
              fontSize: "24px",
              fontWeight: "bold",
              margin: "0 0 15px 0",
              color: "#000"
            }}>
              تقرير الحركات المالية التفصيلي
            </h1>
            <div style={{
              fontSize: "12px",
              color: "#666",
              lineHeight: "1.6"
            }}>
              <div>
                <strong>معايير التقرير:</strong>
                {reportEmployee && (
                  <span> • الموظف: {employees.find(e => (e._id || e.id) === reportEmployee)?.name}</span>
                )}
                {start && <span> • من تاريخ: {start}</span>}
                {end && <span> • إلى تاريخ: {end}</span>}
              </div>
              <div>
                <strong>تاريخ الطباعة:</strong> {new Date().toLocaleDateString("ar-SA")}
                <strong> • الوقت:</strong> {new Date().toLocaleTimeString("ar-SA")}
                <strong> • عدد السجلات:</strong> {filteredReport.length}
              </div>
            </div>
          </div>

          {/* إجماليات الطباعة */}
          <div style={{
            display: "table",
            width: "100%",
            marginBottom: "25px",
            border: "1px solid #333"
          }}>
            <div style={{ display: "table-row" }}>
              <div style={{
                display: "table-cell",
                padding: "10px",
                textAlign: "center",
                border: "1px solid #333",
                background: "#f8f9fa",
                fontWeight: "bold"
              }}>
                المستحقات<br/>{due.toLocaleString()}
              </div>
              <div style={{
                display: "table-cell",
                padding: "10px",
                textAlign: "center",
                border: "1px solid #333",
                background: "#f8f9fa",
                fontWeight: "bold"
              }}>
                الدفعات<br/>{paid.toLocaleString()}
              </div>
              <div style={{
                display: "table-cell",
                padding: "10px",
                textAlign: "center",
                border: "1px solid #333",
                background: "#f8f9fa",
                fontWeight: "bold"
              }}>
                السلف<br/>{loan.toLocaleString()}
              </div>
              <div style={{
                display: "table-cell",
                padding: "10px",
                textAlign: "center",
                border: "1px solid #333",
                background: "#f8f9fa",
                fontWeight: "bold"
              }}>
                الخصومات<br/>{discount.toLocaleString()}
              </div>
              <div style={{
                display: "table-cell",
                padding: "10px",
                textAlign: "center",
                border: "1px solid #333",
                background: "#f8f9fa",
                fontWeight: "bold"
              }}>
                الرصيد النهائي<br/>{finalBalance.toLocaleString()}
              </div>
            </div>
          </div>

          {/* جدول البيانات للطباعة */}
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "11px"
          }}>
            <thead>
              <tr>
                <th style={{
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "bold",
                  border: "1px solid #333",
                  background: "#f0f0f0"
                }}>
                  التاريخ
                </th>
                <th style={{
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "bold",
                  border: "1px solid #333",
                  background: "#f0f0f0"
                }}>
                  الموظف
                </th>
                <th style={{
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  border: "1px solid #333",
                  background: "#f0f0f0"
                }}>
                  النوع
                </th>
                <th style={{
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  border: "1px solid #333",
                  background: "#f0f0f0"
                }}>
                  المبلغ
                </th>
                <th style={{
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "bold",
                  border: "1px solid #333",
                  background: "#f0f0f0"
                }}>
                  ملاحظة
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReport.map((p, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "6px", border: "1px solid #333" }}>
                    {new Date(p.date).toLocaleDateString("ar-SA")}
                  </td>
                  <td style={{ padding: "6px", border: "1px solid #333" }}>
                    {p.employee?.name || "-"}
                  </td>
                  <td style={{ padding: "6px", textAlign: "center", border: "1px solid #333" }}>
                    {p.type}
                  </td>
                  <td style={{ padding: "6px", textAlign: "center", border: "1px solid #333" }}>
                    {p.amount?.toLocaleString() || 0} ريال
                  </td>
                  <td style={{ padding: "6px", border: "1px solid #333" }}>
                    {p.notes || "لا توجد ملاحظة"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ========== التبويب الثاني: كشف مستحقات جميع الموظفين ==========
function AllEmployeesDueTab() {
  const [allDue, setAllDue] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/payments/dues-by-employee`)
      .then(res => res.json())
      .then(data => {
        setAllDue(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setAllDue([]);
        setLoading(false);
      });
  }, []);

  const filtered = allDue.filter(
    row =>
      row.name?.toLowerCase().includes(search.toLowerCase()) ||
      row.username?.toLowerCase().includes(search.toLowerCase())
  );

  // حساب الإجماليات
  const totals = filtered.reduce((acc, row) => ({
    due: acc.due + (row.due || 0),
    paid: acc.paid + (row.paid || 0),
    loan: acc.loan + (row.loan || 0),
    discount: acc.discount + (row.discount || 0),
    total: acc.total + (row.total || 0)
  }), { due: 0, paid: 0, loan: 0, discount: 0, total: 0 });

  // دالة الطباعة للكشف
  const handlePrintDue = () => {
    const printContent = document.getElementById('printable-due-content');
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <div style={{ fontFamily: "'Cairo', sans-serif", direction: "rtl" }}>
      <div style={{
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "20px",
        padding: "15px 20px",
        background: "#f8f9fa",
        borderRadius: "10px",
        border: "2px solid #e9ecef"
      }}>
        <h3 style={{ color: "#2c3e50", margin: 0, fontSize: "18px", fontWeight: "700" }}>
          👥 كشف مستحقات جميع الموظفين ({filtered.length})
        </h3>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="🔍 بحث باسم الموظف أو اسم المستخدم"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: "10px 15px",
              borderRadius: "8px",
              border: "2px solid #e9ecef",
              width: "280px",
              fontSize: "14px",
              fontFamily: "'Cairo', sans-serif"
            }}
          />
          <button
            onClick={handlePrintDue}
            disabled={filtered.length === 0}
            style={{
              background: filtered.length === 0 ? "#6c757d" : "#007bff",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "14px",
              cursor: filtered.length === 0 ? "not-allowed" : "pointer",
              fontFamily: "'Cairo', sans-serif"
            }}
          >
            🖨️ طباعة الكشف
          </button>
        </div>
      </div>

      {/* الإجماليات العامة */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))",
        gap: "12px",
        marginBottom: "20px",
        padding: "15px",
        background: "#f8f9fa",
        borderRadius: "10px",
        border: "2px solid #e9ecef"
      }}>
        <div style={{
          background: "#d4edda",
          padding: "12px",
          borderRadius: "8px",
          textAlign: "center",
          border: "1px solid #c3e6cb"
        }}>
          <div style={{ fontSize: "14px", color: "#155724", fontWeight: "600" }}>إجمالي المستحقات</div>
          <div style={{ fontSize: "18px", color: "#155724", fontWeight: "800" }}>
            {totals.due.toLocaleString()}
          </div>
        </div>

        <div style={{
          background: "#cce5ff",
          padding: "12px",
          borderRadius: "8px",
          textAlign: "center",
          border: "1px solid #b3d9ff"
        }}>
          <div style={{ fontSize: "14px", color: "#004085", fontWeight: "600" }}>إجمالي الدفعات</div>
          <div style={{ fontSize: "18px", color: "#004085", fontWeight: "800" }}>
            {totals.paid.toLocaleString()}
          </div>
        </div>

        <div style={{
          background: "#fff3cd",
          padding: "12px",
          borderRadius: "8px",
          textAlign: "center",
          border: "1px solid #ffeaa7"
        }}>
          <div style={{ fontSize: "14px", color: "#856404", fontWeight: "600" }}>إجمالي السلف</div>
          <div style={{ fontSize: "18px", color: "#856404", fontWeight: "800" }}>
            {totals.loan.toLocaleString()}
          </div>
        </div>

        <div style={{
          background: "#f8d7da",
          padding: "12px",
          borderRadius: "8px",
          textAlign: "center",
          border: "1px solid #f5c6cb"
        }}>
          <div style={{ fontSize: "14px", color: "#721c24", fontWeight: "600" }}>إجمالي الخصومات</div>
          <div style={{ fontSize: "18px", color: "#721c24", fontWeight: "800" }}>
            {totals.discount.toLocaleString()}
          </div>
        </div>

        <div style={{
          background: totals.total >= 0 ? "#d4edda" : "#f8d7da",
          padding: "12px",
          borderRadius: "8px",
          textAlign: "center",
          border: `1px solid ${totals.total >= 0 ? "#c3e6cb" : "#f5c6cb"}`
        }}>
          <div style={{ 
            fontSize: "14px", 
            color: totals.total >= 0 ? "#155724" : "#721c24",
            fontWeight: "600"
          }}>
            الرصيد الإجمالي
          </div>
          <div style={{ 
            fontSize: "20px", 
            color: totals.total >= 0 ? "#155724" : "#721c24", 
            fontWeight: "900" 
          }}>
            {totals.total.toLocaleString()}
          </div>
        </div>
      </div>

      {/* جدول الكشف */}
      <div>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
            ⏳ جاري تحميل البيانات...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
            <div style={{ fontSize: "48px", marginBottom: "10px" }}>👥</div>
            <div style={{ fontSize: "18px", fontWeight: "600" }}>لا يوجد موظفين</div>
          </div>
        ) : (
          <div style={{ 
            overflowX: "auto",
            border: "2px solid #dee2e6",
            borderRadius: "10px"
          }}>
            <table style={{
              width: "100%",
              minWidth: "800px",
              borderCollapse: "collapse",
              background: "#fff",
              fontSize: "13px"
            }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  <th style={{ 
                    padding: "15px 12px", 
                    textAlign: "right", 
                    fontWeight: "700",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6"
                  }}>
                    الموظف
                  </th>
                  <th style={{ 
                    padding: "15px 12px", 
                    textAlign: "center", 
                    fontWeight: "700",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6"
                  }}>
                    المستحقات
                  </th>
                  <th style={{ 
                    padding: "15px 12px", 
                    textAlign: "center", 
                    fontWeight: "700",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6"
                  }}>
                    الدفعات
                  </th>
                  <th style={{ 
                    padding: "15px 12px", 
                    textAlign: "center", 
                    fontWeight: "700",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6"
                  }}>
                    السلف
                  </th>
                  <th style={{ 
                    padding: "15px 12px", 
                    textAlign: "center", 
                    fontWeight: "700",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6"
                  }}>
                    الخصومات
                  </th>
                  <th style={{ 
                    padding: "15px 12px", 
                    textAlign: "center", 
                    fontWeight: "700",
                    color: "#495057",
                    borderBottom: "2px solid #dee2e6"
                  }}>
                    الرصيد النهائي
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr key={idx} style={{ 
                    borderBottom: "1px solid #dee2e6",
                    background: idx % 2 === 0 ? "#fff" : "#f8f9fa"
                  }}>
                    <td style={{ padding: "12px", fontWeight: "600" }}>
                      {row.name} ({row.username})
                    </td>
                    <td style={{ 
                      padding: "12px", 
                      textAlign: "center",
                      color: "#28a745",
                      fontWeight: "600"
                    }}>
                      {(row.due || 0).toLocaleString()}
                    </td>
                    <td style={{ 
                      padding: "12px", 
                      textAlign: "center",
                      color: "#007bff",
                      fontWeight: "600"
                    }}>
                      {(row.paid || 0).toLocaleString()}
                    </td>
                    <td style={{ 
                      padding: "12px", 
                      textAlign: "center",
                      color: "#ffc107",
                      fontWeight: "600"
                    }}>
                      {(row.loan || 0).toLocaleString()}
                    </td>
                    <td style={{ 
                      padding: "12px", 
                      textAlign: "center",
                      color: "#dc3545",
                      fontWeight: "600"
                    }}>
                      {(row.discount || 0).toLocaleString()}
                    </td>
                    <td style={{ 
                      padding: "12px", 
                      textAlign: "center",
                      fontWeight: "800",
                      fontSize: "14px",
                      color: (row.total || 0) >= 0 ? "#28a745" : "#dc3545",
                      background: (row.total || 0) >= 0 
                        ? "rgba(40, 167, 69, 0.1)" 
                        : "rgba(220, 53, 69, 0.1)"
                    }}>
                      {(row.total || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* محتوى طباعة الكشف المخفي */}
      <div id="printable-due-content" style={{ display: "none" }}>
        <div style={{
          fontFamily: "'Cairo', Tahoma, Arial, sans-serif",
          direction: "rtl",
          padding: "20px",
          fontSize: "12px",
          lineHeight: "1.4"
        }}>
          {/* عنوان الكشف */}
          <div style={{
            textAlign: "center",
            marginBottom: "25px",
            borderBottom: "3px solid #333",
            paddingBottom: "15px"
          }}>
            <h1 style={{
              fontSize: "24px",
              fontWeight: "bold",
              margin: "0 0 15px 0",
              color: "#000"
            }}>
              كشف مستحقات جميع الموظفين
            </h1>
            <div style={{
              fontSize: "12px",
              color: "#666"
            }}>
              <strong>تاريخ الطباعة:</strong> {new Date().toLocaleDateString("ar-SA")}
              <strong> • الوقت:</strong> {new Date().toLocaleTimeString("ar-SA")}
              <strong> • عدد الموظفين:</strong> {filtered.length}
            </div>
          </div>

          {/* إجماليات الطباعة */}
          <div style={{
            display: "table",
            width: "100%",
            marginBottom: "25px",
            border: "1px solid #333"
          }}>
            <div style={{ display: "table-row" }}>
              <div style={{
                display: "table-cell",
                padding: "10px",
                textAlign: "center",
                border: "1px solid #333",
                background: "#f8f9fa",
                fontWeight: "bold"
              }}>
                إجمالي المستحقات<br/>{totals.due.toLocaleString()}
              </div>
              <div style={{
                display: "table-cell",
                padding: "10px",
                textAlign: "center",
                border: "1px solid #333",
                background: "#f8f9fa",
                fontWeight: "bold"
              }}>
                إجمالي الدفعات<br/>{totals.paid.toLocaleString()}
              </div>
              <div style={{
                display: "table-cell",
                padding: "10px",
                textAlign: "center",
                border: "1px solid #333",
                background: "#f8f9fa",
                fontWeight: "bold"
              }}>
                إجمالي السلف<br/>{totals.loan.toLocaleString()}
              </div>
              <div style={{
                display: "table-cell",
                padding: "10px",
                textAlign: "center",
                border: "1px solid #333",
                background: "#f8f9fa",
                fontWeight: "bold"
              }}>
                إجمالي الخصومات<br/>{totals.discount.toLocaleString()}
              </div>
              <div style={{
                display: "table-cell",
                padding: "10px",
                textAlign: "center",
                border: "1px solid #333",
                background: "#f8f9fa",
                fontWeight: "bold"
              }}>
                الرصيد الإجمالي<br/>{totals.total.toLocaleString()}
              </div>
            </div>
          </div>

          {/* جدول البيانات للطباعة */}
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "11px"
          }}>
            <thead>
              <tr>
                <th style={{
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "bold",
                  border: "1px solid #333",
                  background: "#f0f0f0"
                }}>
                  الموظف
                </th>
                <th style={{
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  border: "1px solid #333",
                  background: "#f0f0f0"
                }}>
                  المستحقات
                </th>
                <th style={{
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  border: "1px solid #333",
                  background: "#f0f0f0"
                }}>
                  الدفعات
                </th>
                <th style={{
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  border: "1px solid #333",
                  background: "#f0f0f0"
                }}>
                  السلف
                </th>
                <th style={{
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  border: "1px solid #333",
                  background: "#f0f0f0"
                }}>
                  الخصومات
                </th>
                <th style={{
                  padding: "8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  border: "1px solid #333",
                  background: "#f0f0f0"
                }}>
                  الرصيد النهائي
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "6px", border: "1px solid #333" }}>
                    {row.name} ({row.username})
                  </td>
                  <td style={{ padding: "6px", textAlign: "center", border: "1px solid #333" }}>
                    {(row.due || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "6px", textAlign: "center", border: "1px solid #333" }}>
                    {(row.paid || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "6px", textAlign: "center", border: "1px solid #333" }}>
                    {(row.loan || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "6px", textAlign: "center", border: "1px solid #333" }}>
                    {(row.discount || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "6px", textAlign: "center", border: "1px solid #333" }}>
                    {(row.total || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ========== الصفحة الرئيسية بالتبويبات ==========
export default function PaymentsAndReportPage() {
  const [tab, setTab] = useState("report");

  return (
    <div style={{ 
      maxWidth: 1200, 
      margin: "30px auto", 
      padding: "25px", 
      background: "#fff", 
      borderRadius: "15px", 
      boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
      fontFamily: "'Cairo', sans-serif",
      direction: "rtl"
    }}>
      <h2 style={{
        textAlign: "center", 
        marginBottom: "30px",
        fontSize: "24px",
        fontWeight: "700",
        color: "#2c3e50"
      }}>
        💰 إدارة الحركات المالية والتقارير
      </h2>

      {/* Tabs */}
      <div style={{ 
        display: "flex", 
        gap: "15px", 
        marginBottom: "30px",
        justifyContent: "center",
        background: "#f8f9fa",
        padding: "10px",
        borderRadius: "12px",
        border: "2px solid #e9ecef"
      }}>
        <button
          onClick={() => setTab("report")}
          style={{ 
            padding: "12px 25px", 
            borderRadius: "10px", 
            fontWeight: "700",
            background: tab === "report" ? "linear-gradient(135deg, #007bff 0%, #0056b3 100%)" : "#fff",
            color: tab === "report" ? "#fff" : "#495057", 
            border: "2px solid #007bff", 
            fontSize: "15px", 
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontFamily: "'Cairo', sans-serif"
          }}
        >
          📊 تقرير الحركات المالية
        </button>
        <button
          onClick={() => setTab("allDue")}
          style={{ 
            padding: "12px 25px", 
            borderRadius: "10px", 
            fontWeight: "700",
            background: tab === "allDue" ? "linear-gradient(135deg, #28a745 0%, #1e7e34 100%)" : "#fff",
            color: tab === "allDue" ? "#fff" : "#495057", 
            border: "2px solid #28a745", 
            fontSize: "15px", 
            cursor: "pointer",
            transition: "all 0.3s ease",
            fontFamily: "'Cairo', sans-serif"
          }}
        >
          👥 كشف مستحقات الموظفين
        </button>
      </div>

      {tab === "report" ? <FinancialReportTab /> : null}
      {tab === "allDue" ? <AllEmployeesDueTab /> : null}
    </div>
  );
}