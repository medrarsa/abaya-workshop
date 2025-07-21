import React, { useState, useEffect } from "react";
const BASE_URL = process.env.REACT_APP_API_URL;
const STAGES = [
  "قصاص", "مطرز", "خياط", "كواية", "مركب أزرار", "موظف الشحن", "جديد"
];

const STAGE_COLORS = {
  "قصاص": "#e74c3c",
  "مطرز": "#9b59b6", 
  "خياط": "#3498db",
  "كواية": "#e67e22",
  "مركب أزرار": "#1abc9c",
  "موظف الشحن": "#f39c12",
  "جديد": "#2ecc71"
};

export default function OrderStagesPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [grouped, setGrouped] = useState({});
  const [newOrders, setNewOrders] = useState([]);
  const [selectedStage, setSelectedStage] = useState(STAGES[0]);
  const [loading, setLoading] = useState(false);
  
  // التقسيم والبحث
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [sortBy, setSortBy] = useState("newest");

  // جلب الطلبات الجديدة
  async function fetchNewOrders() {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/orderitems/new`);
      const data = await res.json();
      setNewOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setNewOrders([]);
    }
    setLoading(false);
  }

  // جلب مراحل الطلبات
  async function fetchData() {
    setLoading(true);
    try {
      let url = `${BASE_URL}/api/orders/stages-summary?`;
      if (from) url += `from=${from}&`;
      if (to) url += `to=${to}&`;
      const res = await fetch(url);
      const data = await res.json();
      let groups = {};
      STAGES.forEach(stage => { groups[stage] = []; });
      
      if (Array.isArray(data)) {
        data.forEach(order => {
          const stage = order.lastStage || "جديد";
          if (!groups[stage]) groups[stage] = [];
          groups[stage].push(order);
        });
      }
      
      setGrouped(groups);
      setCurrentPage(1);
    } catch (err) {
      console.error('خطأ في جلب البيانات:', err);
      setGrouped({});
    }
    setLoading(false);
  }

    // دالة حذف المرحلة
  async function handleDeleteStage(order) {
    let stepId = null;
    if (order.timeline && order.timeline.length > 0) {
      const lastStep = order.timeline.find(st => st.stage === order.lastStage);
      if (lastStep && lastStep._id) stepId = lastStep._id;
    }
    if (!stepId && order.stepId) stepId = order.stepId;
    if (!stepId && order.orderItemStepId) stepId = order.orderItemStepId;
    if (!stepId) {
      alert("تعذر تحديد رقم المرحلة (Step ID) لهذا السطر.");
      return;
    }
    if (!window.confirm("هل أنت متأكد من حذف هذه المرحلة؟ سيتم تعديل الرصيد والمخزون تلقائياً.")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/orderitemsteps/${stepId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data && data.message) {
        alert(data.message);
        fetchData();
      } else {
        alert("فشل في الحذف!");
      }
    } catch (e) {
      alert("خطأ في عملية الحذف");
    }
  }
 
 async function handleDeleteNewOrder(orderId, orderIdInOrders) {
  if (!window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
  try {
    // جلب جميع الطلبات لنفس order
    const res = await fetch(`${BASE_URL}/api/orderitems?order=${orderIdInOrders}`);
    const orders = await res.json();

    // حذف الطلب نفسه من orderitems
    await fetch(`${BASE_URL}/api/orderitems/${orderId}`, { method: "DELETE" });

    // إذا كان الطلب الوحيد احذف سجل العميل من orders
    if (orders.length === 1 && orderIdInOrders && orderIdInOrders.length === 24) {
      const res2 = await fetch(`${BASE_URL}/api/orders/${orderIdInOrders}`, { method: "DELETE" });
      const data2 = await res2.json();
      if (data2 && (data2.status || data2.message)) {
        alert("تم حذف الطلب وسجل العميل (order) بنجاح!");
      } else {
        alert("تم حذف الطلب فقط — العميل لم يُحذف (تأكد من الـID)!");
      }
    } else {
      alert("تم حذف الطلب فقط (العميل عنده طلبات أخرى)!");
    }

    fetchNewOrders();
    fetchData();
  } catch (e) {
    alert("خطأ في عملية الحذف");
  }
}


  useEffect(() => {
    fetchNewOrders();
    fetchData();
  }, []);
  
  useEffect(() => { 
    fetchData(); 
    setCurrentPage(1);
  }, [from, to]);

  // تحديث عداد الطلبات الجديدة
  grouped["جديد"] = newOrders.map(order => ({
    ...order,
    lastStage: "جديد",
    timeline: [],
  }));

  // تصفية وترتيب الطلبات
  const filteredOrders = (grouped[selectedStage] || []).filter(order => 
    !searchTerm || 
    order.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderNumber?.toString().includes(searchTerm) ||
    order.barcode?.includes(searchTerm) ||
    order.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.receivedAt || 0) - new Date(a.receivedAt || 0);
      case "oldest":
        return new Date(a.receivedAt || 0) - new Date(b.receivedAt || 0);
      case "customer":
        return (a.customer || "").localeCompare(b.customer || "");
      case "orderNumber":
        return (a.orderNumber || 0) - (b.orderNumber || 0);
      default:
        return 0;
    }
  });

  // تقسيم الصفحات
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // إجمالي الطلبات
  const totalOrders = Object.values(grouped).reduce((sum, orders) => sum + orders.length, 0);

  return (
    <div style={{ 
      fontFamily: "'Cairo', Tahoma, Arial, sans-serif",
      direction: "rtl",
      background: "#f8f9fa",
      minHeight: "100vh",
      padding: "20px"
    }}>
      {/* Header */}
      <div style={{
        background: "#fff",
        padding: "25px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        marginBottom: "20px",
        border: "1px solid #e9ecef"
      }}>
        <h1 style={{
          margin: "0 0 20px 0",
          fontSize: "24px",
          fontWeight: "700",
          color: "#2c3e50",
          textAlign: "center"
        }}>
          📋 مراحل الطلبات والتتبع
        </h1>

        {/* Controls */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 2fr auto auto auto",
          gap: "15px",
          alignItems: "end"
        }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600", color: "#495057" }}>
              من تاريخ
            </label>
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600", color: "#495057" }}>
              إلى تاريخ
            </label>
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "600", color: "#495057" }}>
              بحث سريع
            </label>
            <input
              type="text"
              placeholder="رقم الطلب، العميل، الباركود، الموديل..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            />
          </div>

          <button
            onClick={fetchData}
            style={{
              padding: "8px 16px",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            بحث
          </button>

          <button
            onClick={() => { setFrom(""); setTo(""); setSearchTerm(""); fetchData(); }}
            style={{
              padding: "8px 16px",
              background: "#6c757d",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            تصفير
          </button>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: "8px 10px",
              border: "1px solid #ced4da",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              background: "#fff"
            }}
          >
            <option value="newest">الأحدث أولاً</option>
            <option value="oldest">الأقدم أولاً</option>
            <option value="customer">حسب العميل</option>
            <option value="orderNumber">حسب رقم الطلب</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "15px",
        marginBottom: "20px"
      }}>
        <div style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          textAlign: "center",
          border: "1px solid #e9ecef"
        }}>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#007bff" }}>
            {totalOrders.toLocaleString()}
          </div>
          <div style={{ fontSize: "14px", color: "#6c757d", fontWeight: "600" }}>إجمالي الطلبات</div>
        </div>

        <div style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          textAlign: "center",
          border: "1px solid #e9ecef"
        }}>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#28a745" }}>
            {filteredOrders.length.toLocaleString()}
          </div>
          <div style={{ fontSize: "14px", color: "#6c757d", fontWeight: "600" }}>طلبات {selectedStage}</div>
        </div>

        <div style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          textAlign: "center",
          border: "1px solid #e9ecef"
        }}>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#ffc107" }}>
            {currentOrders.length}
          </div>
          <div style={{ fontSize: "14px", color: "#6c757d", fontWeight: "600" }}>معروض حالياً</div>
        </div>

        <div style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          textAlign: "center",
          border: "1px solid #e9ecef"
        }}>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#6f42c1" }}>
            {totalPages}
          </div>
          <div style={{ fontSize: "14px", color: "#6c757d", fontWeight: "600" }}>إجمالي الصفحات</div>
        </div>
      </div>

      {/* Stages Tabs */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        flexWrap: "wrap"
      }}>
        {STAGES.map(stage => (
          <button
            key={stage}
            onClick={() => {
              setSelectedStage(stage);
              setCurrentPage(1);
              setSearchTerm("");
            }}
            style={{
              background: selectedStage === stage ? STAGE_COLORS[stage] : "#fff",
              color: selectedStage === stage ? "#fff" : STAGE_COLORS[stage],
              border: `2px solid ${STAGE_COLORS[stage]}`,
              borderRadius: "8px",
              padding: "10px 15px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              minWidth: "120px",
              textAlign: "center"
            }}
          >
            <div>{stage}</div>
            <div style={{ fontSize: "16px", fontWeight: "700", marginTop: "2px" }}>
              ({grouped[stage]?.length || 0})
            </div>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: "#fff",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #e9ecef"
      }}>
        {/* Table Header */}
        <div style={{
          background: STAGE_COLORS[selectedStage],
          color: "#fff",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
            {selectedStage} ({filteredOrders.length.toLocaleString()})
          </h3>
          {filteredOrders.length > itemsPerPage && (
            <div style={{ fontSize: "14px" }}>
              صفحة {currentPage} من {totalPages}
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ 
            padding: "40px", 
            textAlign: "center", 
            color: "#6c757d",
            fontSize: "16px"
          }}>
            جاري تحميل البيانات...
          </div>
        ) : currentOrders.length > 0 ? (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px"
              }}>
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    <th style={{ padding: "12px 8px", textAlign: "right", fontWeight: "600", borderBottom: "1px solid #dee2e6", minWidth: "80px" }}>
                      رقم الطلب
                    </th>
                    <th style={{ padding: "12px 8px", textAlign: "right", fontWeight: "600", borderBottom: "1px solid #dee2e6", minWidth: "100px" }}>
                      العميل
                    </th>
                    <th style={{ padding: "12px 2px", textAlign: "right", fontWeight: "600", borderBottom: "1px solid #dee2e6", minWidth: "80px" }}>
                      المدينة
                    </th>
                    <th style={{ padding: "12px 2px", textAlign: "right", fontWeight: "600", borderBottom: "1px solid #dee2e6", minWidth: "100px" }}>
                      الموديل
                    </th>
                    <th style={{ padding: "12px 2px", textAlign: "center", fontWeight: "600", borderBottom: "1px solid #dee2e6", minWidth: "60px" }}>
                      المقاس
                    </th>
                    <th style={{ padding: "12px 2px", textAlign: "right", fontWeight: "600", borderBottom: "1px solid #dee2e6", minWidth: "100px" }}>
                      القماش
                    </th>
                    <th style={{ padding: "12px 30px", textAlign: "center", fontWeight: "600", borderBottom: "1px solid #dee2e6", minWidth: "60px" }}>
                      الكمية
                    </th>
                    <th style={{ padding: "12px 2px", textAlign: "right", fontWeight: "600", borderBottom: "1px solid #dee2e6", minWidth: "100px" }}>
                      الموظف الحالي
                    </th>
                    <th style={{ padding: "12px 2px", textAlign: "center", fontWeight: "600", borderBottom: "1px solid #dee2e6", minWidth: "80px" }}>
                      السعر
                    </th>
                    <th style={{ padding: "12px 2px", textAlign: "center", fontWeight: "600", borderBottom: "1px solid #dee2e6", minWidth: "100px" }}>
                      تاريخ المرحلة
                    </th>
                    <th style={{ padding: "12px 8px", textAlign: "center", fontWeight: "600", borderBottom: "1px solid #dee2e6", minWidth: "200px" }}>
                      خط سير العمليات
                    </th>
                    <th style={{ padding: "12px 8px", textAlign: "center", fontWeight: "600", borderBottom: "1px solid #dee2e6", minWidth: "120px" }}>
                      الباركود
                    </th>
                    <th style={{ padding: "12px 8px", textAlign: "center", fontWeight: "600", borderBottom: "1px solid #dee2e6", minWidth: "70px" }}>حذف</th>

                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order, idx) => (
                    <tr key={order._id} style={{ 
                      borderBottom: "1px solid #dee2e6",
                      background: idx % 2 === 0 ? "#fff" : "#f8f9fa"
                    }}>
                      <td style={{ padding: "10px 8px", fontWeight: "600", color: "#007bff" }}>
                        #{order.orderNumber || "-"}
                      </td>
                      <td style={{ padding: "10px 8px", fontWeight: "600" }}>
                        {order.customer || "-"}
                      </td>
                      <td style={{ padding: "10px 8px", color: "#6c757d" }}>
                        {order.city || "-"}
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        {order.modelName || "-"}
                      </td>
                      <td style={{ padding: "10px 6px", textAlign: "center", fontWeight: "600" }}>
                        {order.size || "-"}
                      </td>
                      <td style={{ padding: "10px 6px" }}>
                        {order.fabricName || "-"}
                      </td>
                      <td style={{ padding: "10px 10px", textAlign: "center" }}>
                       {(order.metersNeeded ? order.metersNeeded + " متر" : "-") +
    (order.pieceSequence ? ` (${order.pieceSequence} كمية)` : "")}
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <div style={{ fontWeight: "600", color: STAGE_COLORS[selectedStage] }}>
                          {order.employeeName || "-"}
                        </div>
                        {order.employeeJob && (
                          <div style={{ fontSize: "11px", color: "#6c757d" }}>
                            ({order.employeeJob})
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "center", fontWeight: "600", color: "#28a745" }}>
                        {order.employeeAmount ? `${order.employeeAmount} ريال` : "-"}
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "center", fontSize: "11px" }}>
                        {order.receivedAt ? new Date(order.receivedAt).toLocaleDateString("ar-SA") : "-"}
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        {order.timeline && order.timeline.length > 0 ? (
                          <div style={{ fontSize: "11px" }}>
                            {order.timeline.map((step, stepIdx) => (
                              <div key={stepIdx} style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                marginBottom: "3px",
                                padding: "2px 6px",
                                background: step.stage === order.lastStage ? `${STAGE_COLORS[step.stage] || STAGE_COLORS[selectedStage]}20` : "#f8f9fa",
                                borderRadius: "4px",
                                border: step.stage === order.lastStage ? `1px solid ${STAGE_COLORS[step.stage] || STAGE_COLORS[selectedStage]}` : "1px solid #e9ecef"
                              }}>
                                <span style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  background: STAGE_COLORS[step.stage] || "#6c757d",
                                  display: "inline-block"
                                }}></span>
                                <span style={{ fontWeight: step.stage === order.lastStage ? "600" : "normal" }}>
                                  {step.stage} ← {step.employeeName || "غير محدد"}
                                </span>
                                {step.stage === order.lastStage && (
                                  <span style={{ color: STAGE_COLORS[step.stage] || STAGE_COLORS[selectedStage], fontWeight: "600" }}>
                                    ✓
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: "#6c757d", fontSize: "11px", fontStyle: "italic" }}>
                            لم تبدأ أي مراحل
                          </span>
                        )}
                      </td>
                      <td style={{ 
                        padding: "10px 8px", 
                        textAlign: "center",
                        fontSize: "10px",
                        fontFamily: "monospace",
                        color: "#6c757d"
                      }}>
                        {order.barcode || "لا يوجد"}
                      </td>
<td style={{ textAlign: "center" }}>
  {/* إذا كان الطلب جديد وما له timeline أو حركة */}
  {order.timeline?.length === 0 || !order.timeline ? (
<button
  style={{
    background: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "6px 10px",
    cursor: "pointer",
    fontWeight: "700"
  }}
  onClick={() => {
    if (window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
      fetch(`${BASE_URL}/api/orderitems/delete-with-order/${order._id}`, { method: "DELETE" })
        .then(res => res.json())
        .then(data => {
          alert(data.message || "تم الحذف!");
          fetchNewOrders();
          fetchData();
        })
        .catch(() => alert("خطأ في الحذف"));
    }
  }}
>
  حذف
</button>

    
  ) : (
    <button
      style={{
        background: "#e74c3c",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        padding: "6px 10px",
        cursor: "pointer",
        fontWeight: "700"
      }}
      onClick={() => handleDeleteStage(order)}
      title="حذف المرحلة"
    >
      حذف
    </button>
  )}
</td>



                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                padding: "15px 20px",
                borderTop: "1px solid #dee2e6",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px"
              }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: "6px 12px",
                    background: currentPage === 1 ? "#e9ecef" : "#007bff",
                    color: currentPage === 1 ? "#6c757d" : "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    fontSize: "14px"
                  }}
                >
                  السابق
                </button>

                <span style={{ fontSize: "14px", color: "#495057", fontWeight: "600" }}>
                  صفحة {currentPage} من {totalPages} ({filteredOrders.length.toLocaleString()} سجل)
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "6px 12px",
                    background: currentPage === totalPages ? "#e9ecef" : "#007bff",
                    color: currentPage === totalPages ? "#6c757d" : "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                    fontSize: "14px"
                  }}
                >
                  التالي
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{
            padding: "40px",
            textAlign: "center",
            color: "#6c757d"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>📂</div>
            <div style={{ fontSize: "16px", fontWeight: "600" }}>
              لا توجد طلبات في مرحلة {selectedStage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}