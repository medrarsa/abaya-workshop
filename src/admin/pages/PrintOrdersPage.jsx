import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
const BASE_URL = process.env.REACT_APP_API_URL;
function trimNotes(text, limit = 230) {
  if (!text) return "-";
  if (text.length <= limit) return text;
  let trimmed = text.slice(0, limit);
  if (text[limit] !== " ") {
    trimmed = trimmed.slice(0, trimmed.lastIndexOf(" "));
  }
  return trimmed + "...";
}

export default function PrintOrdersPage() {
  const [items, setItems] = useState([]);
  const [models, setModels] = useState([]);
  const [orders, setOrders] = useState([]);
  const [fabricList, setFabricList] = useState([]);
  const [groupDate, setGroupDate] = useState("");
  const [groupNumber, setGroupNumber] = useState("");

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [fabricInput, setFabricInput] = useState("");

  // جلب القطع حسب المجموعة والتاريخ
  useEffect(() => {
    if (!groupDate || !groupNumber) return;
    fetch(
      `${BASE_URL}/api/orderitems?groupDate=${groupDate}&groupNumber=${groupNumber}`
    )
      .then(res => res.json())
      .then(setItems);
  }, [groupDate, groupNumber]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/abayamodels`)
      .then(res => res.json())
      .then(setModels);

    fetch(`${BASE_URL}/api/orders`)
      .then(res => res.json())
      .then(setOrders);

    fetch(`${BASE_URL}/api/fabrics`)
      .then(res => res.json())
      .then(setFabricList);
  }, []);

  const chunked = [];
  for (let i = 0; i < items.length; i += 4) {
    chunked.push(items.slice(i, i + 4));
  }

  return (
    <div className="print-root" style={{ padding: 0, margin: 0 }}>
      {/* زر الطباعة */}
      <button
        onClick={() => window.print()}
        style={{
          margin: "18px 0 8px 24px",
          padding: "9px 28px",
          fontWeight: 700,
          fontSize: 16,
          background: "#008080",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          position: "fixed",
          top: 22,
          left: 22,
          zIndex: 10000
        }}
      >
        طباعة A4
      </button>

      {/* فلاتر البحث + زر الحذف الجماعي */}
      <div style={{ padding: 12, display: "flex", alignItems: "center", gap: 16 }}>
        <label>
          تاريخ المجموعة:
          <input
            type="date"
            value={groupDate}
            onChange={e => setGroupDate(e.target.value)}
            style={{ margin: "0 8px" }}
          />
        </label>
        <label>
          رقم المجموعة:
          <input
            type="number"
            min={1}
            value={groupNumber}
            onChange={e => setGroupNumber(e.target.value)}
            style={{ width: 70, margin: "0 8px" }}
          />
        </label>
        <span style={{ color: "#999" }}>
          {items.length > 0 && `عدد النتائج: ${items.length}`}
        </span>
        {/* زر حذف جميع الطلبات في المجموعة */}
        {groupDate && groupNumber && items.length > 0 && (
          <button
            onClick={async () => {
              if (!window.confirm(`هل تريد حذف جميع الطلبات في المجموعة رقم ${groupNumber} بتاريخ ${groupDate}؟`)) return;
              await fetch(
                `${BASE_URL}/api/orderitems/group-delete?groupDate=${groupDate}&groupNumber=${groupNumber}`,
                { method: "DELETE" }
              );
              window.location.reload();
            }}
            style={{
              marginRight: 12,
              padding: "7px 20px",
              fontWeight: 700,
              background: "#c4000b",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            حذف جميع الطلبات في المجموعة
          </button>
        )}
      </div>

      {(!groupDate || !groupNumber) && (
        <div style={{ padding: 24, color: "#888" }}>
          اختر تاريخ المجموعة ورقم المجموعة لعرض النتائج
        </div>
      )}

      {groupDate && groupNumber && chunked.map((group, pageIdx) => (
        <div key={pageIdx} className="a4-print-page" style={{
          width: "210mm",
          height: "297mm",
          display: "flex",
          flexWrap: "wrap",
          pageBreakAfter: "always"
        }}>
          {group.map((item, i) => {
            const model = models.find(m => m.code === item.model || m._id === item.model);
            const order = orders.find(
              o => String(o._id) === String(item.order) || o.orderNumber === item.orderNumber
            );
            const customerName = order?.customer || "-";
            const orderDate = order?.orderDate || "-";
            return (
              <div
                key={item._id || i}
                style={{
                  width: "50%",
                  height: "50%",
                  boxSizing: "border-box",
                  border: "1.5px dashed #bbb",
                  padding: "4px 0 0 0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  fontFamily: "Tahoma, Arial",
                  cursor: "pointer"
                }}
                onClick={() => {
                  setSelectedItem(item);
                  setNoteInput(item.notes || "");
                  setFabricInput(item.fabric || "");
                }}
              >
                <div style={{
                  display: "flex",
                  width: "98%",
                  justifyContent: "space-between",
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 4,
                  marginTop: 1
                }}>
                  <span>معرّف: {item.model || "-"}</span>
                  <span>الموديل: {model?.name || item.modelName || item.model}</span>
                  <span>المقاس: {item.size}</span>
                  <span>تسلسل: {item.pieceSequence}</span>
                </div>

                {model?.imageUrl ? (
                  <img
                    src={model.imageUrl}
                    alt="صورة الموديل"
                    width={185}
                    height={310}
                    style={{
                      marginBottom: 7,
                      objectFit: "cover",
                      borderRadius: 14,
                      border: "2px solid #eee",
                      boxShadow: "0 2px 8px #ececec"
                    }}
                  />
                ) : (
                  <div style={{
                    width: 185, height: 210,
                    background: "#fafafa", color: "#bbb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 7, borderRadius: 14, border: "2px solid #eee", fontSize: 16
                  }}>صورة الموديل</div>
                )}

                {/* اسم العميل وتاريخ الطلب */}
                <div style={{
                  width: "99%",
                  fontSize: "13px",
                  fontWeight: 700,
                  textAlign: "center",
                  margin: "2px 0 3px 0",
                  letterSpacing: 1,
                  borderBottom: "1px solid #eee"
                }}>
                  <span>العميل: {customerName}</span>
                  <span style={{ margin: "0 10px" }}>|</span>
                  <span>تاريخ الطلب: {orderDate}</span>
                </div>

                <div style={{
                  width: "93%",
                  fontSize: "11px",
                  margin: "0 0 3px 0",
                  direction: "rtl",
                  textAlign: "right",
                  fontWeight: 600,
                  lineHeight: 1.5,
                  letterSpacing: 0.3
                }}>
                  <div
                    style={{
                      minHeight: "35px",
                      maxHeight: "35px",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "flex-start"
                    }}
                  >
                    <b>ملاحظات:</b> {trimNotes(item.notes)}
                  </div>
                </div>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  margin: "5px 0 0 0"
                }}>
                  <QRCode value={item.barcode || item._id || "barcode"} size={85} />
                  <div style={{
                    fontSize: 9,
                    color: "#888",
                    marginTop: 2,
                    direction: "ltr",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                    textAlign: "center"
                  }}>
                    {item.barcode || item._id}
                  </div>
                </div>

                <div style={{
                  width: "98%",
                  fontSize: "13px",
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 7,
                  borderTop: "1px solid #eee",
                  paddingTop: 2
                }}>
                  <span>القماش: {model?.fabricType || item.fabricName || "-"}</span>
                  <span>كمية القماش: {model?.metersNeeded || "-"} متر</span>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* Modal التعديل */}
      {selectedItem && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10001,
          background: "rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: 24, minWidth: 340, minHeight: 170 }}>
            <h3>تعديل القطعة ({selectedItem.modelName || selectedItem.model})</h3>
            <div style={{ marginBottom: 10 }}>
              <label>القماش:
                <select
                  value={fabricInput}
                  onChange={e => setFabricInput(e.target.value)}
                  style={{ marginRight: 10, width: 160 }}
                >
                  <option value="">اختر...</option>
                  {fabricList.map(f => (
                    <option key={f._id} value={f.code || f.name}>
                      {f.name} (متوفر: {f.currentStock} م)
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label>ملاحظات:<br />
                <textarea
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  rows={3} style={{ width: "95%" }}
                />
              </label>
            </div>
            <div style={{ marginTop: 10 }}>
              <button
                onClick={async () => {
                  await fetch(`${BASE_URL}/api/orderitems/${selectedItem._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ notes: noteInput, fabric: fabricInput })
                  });
                  setSelectedItem(null);
                  window.location.reload();
                }}
                style={{ marginLeft: 8, background: "#18a745", color: "#fff", padding: "7px 20px", border: "none", borderRadius: 5 }}
              >حفظ التعديلات</button>
              <button
                onClick={async () => {
                  if (window.confirm("هل أنت متأكد من الحذف؟")) {
                    await fetch(`${BASE_URL}/api/orderitems/${selectedItem._id}`, { method: "DELETE" });
                    setSelectedItem(null);
                    window.location.reload();
                  }
                }}
                style={{ background: "#c4000b", color: "#fff", padding: "7px 20px", border: "none", borderRadius: 5 }}
              >حذف القطعة</button>
              <button
                onClick={() => setSelectedItem(null)}
                style={{ marginLeft: 8 }}
              >إلغاء</button>
            </div>
            <hr />
            <div style={{ marginTop: 14 }}>
              <button
                onClick={async () => {
                  if (!window.confirm("هل تريد حذف جميع الطلبات في هذه المجموعة؟")) return;
                  await fetch(`${BASE_URL}/api/orderitems/group-delete?groupDate=${groupDate}&groupNumber=${groupNumber}`, { method: "DELETE" });
                  setSelectedItem(null);
                  window.location.reload();
                }}
                style={{ background: "#ff6600", color: "#fff", padding: "7px 20px", border: "none", borderRadius: 5 }}
              >حذف جميع الطلبات في المجموعة</button>
            </div>
          </div>
        </div>
      )}

      {/* CSS للطباعة */}
      <style>{`
        @media print {
          .print-root {
            display: block !important;
          }
          body > *:not(.print-root):not(style) {
            display: none !important;
          }
          .a4-print-page {
            width: 210mm !important;
            height: 297mm !important;
            display: flex !important;
            flex-wrap: wrap !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box;
            margin: 0 !important;
            padding: 0 !important;
          }
          .a4-print-page > div {
            width: 50% !important;
            height: 50% !important;
            box-sizing: border-box;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          html, body {
            width: 210mm !important;
            height: auto !important;
            background: #fff !important;
          }
        }
      `}</style>
    </div>
  );
}
