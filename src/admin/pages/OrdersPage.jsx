import React, { useEffect, useState } from "react";
const BASE_URL = process.env.REACT_APP_API_URL;
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [groupDate, setGroupDate] = useState("");
  const [groupNumber, setGroupNumber] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/orders`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => {
        setOrders([]);
        setLoading(false);
      });
  }, []);

  // تصفية حسب البحث أو المجموعة
  const filtered = orders.filter(order =>
    (!search || (order.customer?.includes(search) || String(order.orderNumber).includes(search))) &&
    (!groupDate || order.groupDate === groupDate) &&
    (!groupNumber || String(order.groupNumber) === String(groupNumber))
  );

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

  const closeButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    color: "#e53e3e",
    float: "left",
    marginBottom: "20px"
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
        <h1 style={{
          color: "#fff",
          margin: 0,
          fontSize: "28px",
          fontWeight: "700",
          textAlign: "center",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }}>
          📋 إدارة الطلبات
        </h1>
        <p style={{
          color: "rgba(255,255,255,0.9)",
          textAlign: "center",
          margin: "10px 0 0 0",
          fontSize: "16px"
        }}>
          عرض وإدارة جميع طلبات العملاء
        </p>
      </div>

      <div style={{ padding: "0 30px" }}>
        {/* Search and Filter Section */}
        <div style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "25px",
          marginBottom: "25px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          border: "1px solid rgba(255,255,255,0.2)"
        }}>
          <h3 style={{
            color: "#2d3748",
            marginBottom: "20px",
            fontSize: "18px",
            fontWeight: "600"
          }}>
            🔍 البحث والتصفية
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            alignItems: "end"
          }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#4a5568", fontWeight: "600" }}>
                🔍 البحث
              </label>
              <input
                placeholder="اسم العميل أو رقم الطلب..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#4a5568", fontWeight: "600" }}>
                📅 تاريخ المجموعة
              </label>
              <input
                type="date"
                value={groupDate}
                onChange={e => setGroupDate(e.target.value)}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#4a5568", fontWeight: "600" }}>
                🔢 رقم المجموعة
              </label>
              <input
                placeholder="رقم المجموعة"
                value={groupNumber}
                onChange={e => setGroupNumber(e.target.value)}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
              />
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{
                background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                padding: "12px 20px",
                borderRadius: "10px",
                color: "#2d3748",
                fontWeight: "600"
              }}>
                📊 {filtered.length} طلب
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
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
              📋 قائمة الطلبات ({filtered.length})
            </h3>
          </div>

          {loading ? (
            <div style={{
              padding: "60px",
              textAlign: "center",
              color: "#718096"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
              <h3 style={{ color: "#4a5568", marginBottom: "10px" }}>جاري تحميل الطلبات...</h3>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ 
                width: "100%", 
                borderCollapse: "collapse",
                fontSize: "14px"
              }}>
                <thead>
                  <tr style={{ background: "#f8f9fa" }}>
                    <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #e9ecef", fontWeight: "600", color: "#495057" }}>🔢 رقم الطلب</th>
                    <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #e9ecef", fontWeight: "600", color: "#495057" }}>👤 اسم العميل</th>
                    <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #e9ecef", fontWeight: "600", color: "#495057" }}>📅 تاريخ الطلب</th>
                    <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #e9ecef", fontWeight: "600", color: "#495057" }}>📦 المجموعة</th>
                    <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #e9ecef", fontWeight: "600", color: "#495057" }}>🏙️ المدينة</th>
                    <th style={{ padding: "15px", textAlign: "center", borderBottom: "2px solid #e9ecef", fontWeight: "600", color: "#495057" }}>📊 عدد القطع</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{
                        padding: "60px",
                        textAlign: "center",
                        color: "#718096"
                      }}>
                        <div style={{ fontSize: "48px", marginBottom: "20px" }}>📋</div>
                        <h3 style={{ color: "#4a5568", marginBottom: "10px" }}>لا توجد طلبات</h3>
                        <p>لا توجد طلبات تطابق معايير البحث</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((order, index) => (
                      <tr 
                        key={order._id} 
                        onClick={() => setSelectedOrder(order)}
                        style={{ 
                          background: index % 2 === 0 ? "#fff" : "#f8f9fa",
                          cursor: "pointer",
                          transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.target.parentElement.style.background = "#e3f2fd";
                          e.target.parentElement.style.transform = "scale(1.01)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.parentElement.style.background = index % 2 === 0 ? "#fff" : "#f8f9fa";
                          e.target.parentElement.style.transform = "scale(1)";
                        }}
                      >
                        <td style={{ padding: "15px", textAlign: "center", borderBottom: "1px solid #e9ecef" }}>
                          <span style={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "#fff",
                            padding: "5px 12px",
                            borderRadius: "15px",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}>
                            #{order.orderNumber}
                          </span>
                        </td>
                        <td style={{ padding: "15px", textAlign: "center", borderBottom: "1px solid #e9ecef" }}>
                          <div style={{ fontWeight: "600", color: "#2d3748" }}>{order.customer}</div>
                        </td>
                        <td style={{ padding: "15px", textAlign: "center", borderBottom: "1px solid #e9ecef" }}>
                          <div style={{ color: "#4a5568" }}>{order.orderDate?.split("T")[0]}</div>
                        </td>
                        <td style={{ padding: "15px", textAlign: "center", borderBottom: "1px solid #e9ecef" }}>
                          <div style={{
                            background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                            color: "#2d3748",
                            padding: "5px 12px",
                            borderRadius: "15px",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}>
                            {order.groupDate} / {order.groupNumber}
                          </div>
                        </td>
                        <td style={{ padding: "15px", textAlign: "center", borderBottom: "1px solid #e9ecef" }}>
                          <div style={{ color: "#4a5568" }}>{order.city}</div>
                        </td>
                        <td style={{ padding: "15px", textAlign: "center", borderBottom: "1px solid #e9ecef" }}>
                          <span style={{
                            background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                            color: "#8b4513",
                            padding: "5px 12px",
                            borderRadius: "15px",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}>
                            {order.items?.length || 0} قطعة
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}>
            <div style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "30px",
              width: "95%",
              maxWidth: "1200px",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
            }}>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={closeButtonStyle}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 15px rgba(255, 154, 158, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                ❌ إغلاق
              </button>

              <div style={{ clear: "both" }}>
                <h2 style={{
                  color: "#2d3748",
                  marginBottom: "25px",
                  fontSize: "24px",
                  fontWeight: "600",
                  textAlign: "center",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "#fff",
                  padding: "15px",
                  borderRadius: "15px",
                  margin: "0 0 25px 0"
                }}>
                  📋 تفاصيل الطلب رقم: #{selectedOrder.orderNumber}
                </h2>

                {/* Order Info Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "20px",
                  marginBottom: "30px"
                }}>
                  <div style={{
                    background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                    padding: "20px",
                    borderRadius: "15px"
                  }}>
                    <div style={{ fontSize: "20px", marginBottom: "10px" }}>👤</div>
                    <div style={{ color: "#2d3748", fontWeight: "600", fontSize: "16px" }}>العميل</div>
                    <div style={{ color: "#2d3748", fontSize: "18px", fontWeight: "bold" }}>{selectedOrder.customer}</div>
                  </div>

                  <div style={{
                    background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                    padding: "20px",
                    borderRadius: "15px"
                  }}>
                    <div style={{ fontSize: "20px", marginBottom: "10px" }}>📦</div>
                    <div style={{ color: "#8b4513", fontWeight: "600", fontSize: "16px" }}>المجموعة</div>
                    <div style={{ color: "#8b4513", fontSize: "18px", fontWeight: "bold" }}>
                      {selectedOrder.groupDate} / {selectedOrder.groupNumber}
                    </div>
                  </div>

                  <div style={{
                    background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
                    padding: "20px",
                    borderRadius: "15px"
                  }}>
                    <div style={{ fontSize: "20px", marginBottom: "10px" }}>📅</div>
                    <div style={{ color: "#155724", fontWeight: "600", fontSize: "16px" }}>تاريخ الطلب</div>
                    <div style={{ color: "#155724", fontSize: "18px", fontWeight: "bold" }}>
                      {selectedOrder.orderDate?.split("T")[0]}
                    </div>
                  </div>

                  <div style={{
                    background: "linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)",
                    padding: "20px",
                    borderRadius: "15px"
                  }}>
                    <div style={{ fontSize: "20px", marginBottom: "10px" }}>🏙️</div>
                    <div style={{ color: "#721c24", fontWeight: "600", fontSize: "16px" }}>المدينة</div>
                    <div style={{ color: "#721c24", fontSize: "18px", fontWeight: "bold" }}>{selectedOrder.city}</div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    padding: "20px",
                    borderRadius: "15px",
                    marginBottom: "30px"
                  }}>
                    <div style={{ color: "#fff", fontWeight: "600", fontSize: "16px", marginBottom: "10px" }}>
                      📝 ملاحظات:
                    </div>
                    <div style={{ color: "#fff", fontSize: "16px" }}>{selectedOrder.notes}</div>
                  </div>
                )}

                {/* Items Table */}
                <div style={{
                  background: "#f8f9fa",
                  borderRadius: "15px",
                  overflow: "hidden",
                  border: "2px solid #e9ecef"
                }}>
                  <div style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    padding: "15px",
                    color: "#fff"
                  }}>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
                      👗 قطع الطلب ({selectedOrder.items?.length || 0})
                    </h3>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ 
                      width: "100%", 
                      borderCollapse: "collapse",
                      fontSize: "14px"
                    }}>
                      <thead>
                        <tr style={{ background: "#e9ecef" }}>
                          <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#495057" }}>🔢 رقم الموديل</th>
                          <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#495057" }}>🏷️ اسم الموديل</th>
                          <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#495057" }}>🖼️ الصورة</th>
                          <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#495057" }}>📏 المقاس</th>
                          <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#495057" }}>🧵 القماش</th>
                          <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#495057" }}>📊 الكمية</th>
                          <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#495057" }}>🔢 تسلسل القطعة</th>
                          <th style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#495057" }}>📝 ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedOrder.items || []).length === 0 ? (
                          <tr>
                            <td colSpan={8} style={{
                              padding: "40px",
                              textAlign: "center",
                              color: "#718096"
                            }}>
                              لا توجد قطع في هذا الطلب
                            </td>
                          </tr>
                        ) : (
                          (selectedOrder.items || []).map((item, idx) => (
                            <tr key={idx} style={{ 
                              background: idx % 2 === 0 ? "#fff" : "#f8f9fa"
                            }}>
                              <td style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e9ecef" }}>
                                <span style={{
                                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                  color: "#fff",
                                  padding: "4px 8px",
                                  borderRadius: "10px",
                                  fontSize: "12px",
                                  fontWeight: "600"
                                }}>
                                  {item.model}
                                </span>
                              </td>
                              <td style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e9ecef", fontWeight: "600" }}>
                                {item.modelName}
                              </td>
                              <td style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e9ecef" }}>
                                {item.modelImage ? (
                                  <img 
                                    src={item.modelImage} 
                                    alt="صورة الموديل" 
                                    style={{
                                      width: "60px",
                                      height: "60px",
                                      objectFit: "cover",
                                      borderRadius: "10px",
                                      border: "2px solid #e9ecef"
                                    }}
                                  />
                                ) : (
                                  <div style={{
                                    width: "60px",
                                    height: "60px",
                                    background: "#f8f9fa",
                                    borderRadius: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto",
                                    color: "#718096"
                                  }}>
                                    🖼️
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e9ecef" }}>
                                <span style={{
                                  background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                                  color: "#2d3748",
                                  padding: "4px 8px",
                                  borderRadius: "10px",
                                  fontSize: "12px",
                                  fontWeight: "600"
                                }}>
                                  {item.size}
                                </span>
                              </td>
                              <td style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e9ecef", fontWeight: "600" }}>
                                {item.fabricName}
                              </td>
                              <td style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e9ecef" }}>
                                <span style={{
                                  background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                                  color: "#8b4513",
                                  padding: "4px 8px",
                                  borderRadius: "10px",
                                  fontSize: "12px",
                                  fontWeight: "600"
                                }}>
                                  {item.quantity}
                                </span>
                              </td>
                              <td style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e9ecef", fontWeight: "600" }}>
                                {item.pieceSequence}
                              </td>
                              <td style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #e9ecef", color: "#718096" }}>
                                {item.notes || "-"}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
