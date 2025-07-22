import React, { useEffect, useState } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import { vfs, fonts } from "../../assets/arabicFonts/notoFont"; // عدل المسار حسب مجلدك
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
const BASE_URL = process.env.REACT_APP_API_URL;
pdfMake.vfs = vfs;
pdfMake.fonts = fonts;

export default function StockReportPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [fabricId, setFabricId] = useState("all");
  const [fabrics, setFabrics] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  
  useEffect(() => {
    fetch(`${BASE_URL}/api/fabrics`)
      .then(res => res.json())
      .then(setFabrics);
  }, []);
 
  const fetchReport = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    setReport(null);

    try {
      const res = await fetch(
        `${BASE_URL}/api/fabrics/report/stock?start=${start}&end=${end}&fabricId=${fabricId}`
      );
      const data = await res.json();
      setReport(data);
    } catch {
      setMsg("خطأ في جلب التقرير");
    }
    setLoading(false);
  };

  function exportToPDF() {
    if (!report) return;
    const docDefinition = {
      defaultStyle: {
        font: "NotoNaskhArabic",
        fontSize: 11,
        alignment: "right",
        lineHeight: 1.6,
      },
      pageSize: 'A4',
      pageMargins: [45, 110, 45, 60],
      header: [
        {
          text: "تقرير حركة المخزون",
          alignment: "right",
          fontSize: 18,
          bold: true,
          margin: [0, 30, 0, 20],
          color: "#23527c"
        },
        {
          canvas: [
            { type: "line", x1: 0, y1: 2, x2: 500, y2: 2, lineWidth: 2, lineColor: "#ececec" }
          ]
        }
      ],
      footer: function (currentPage, pageCount) {
        return {
          columns: [
            { text: `صفحة ${currentPage} من ${pageCount}`, alignment: 'right', fontSize: 10, color: "#666" }
          ],
          margin: [0, 12, 0, 0]
        };
      },
      content: [
        {
          table: {
            widths: [120, 100, 100],
            body: [
              [
                { text: "البيان", style: "tableHeader", alignment: "center" },
                { text: "الكمية", style: "tableHeader", alignment: "center" },
                { text: "القيمة (ريال)", style: "tableHeader", alignment: "center" }
              ],
              ["اجمالي الدخول", report.inQty, report.inValue],
              ["اجمالي الخروج", report.outQty, report.outValue],
              [{ text: "الرصيد خلال الفترة", bold: true, color: "#23527c" }, report.balanceQty, report.balanceValue],
              ["رصيد المخزون الحالي", report.currentStock, ""]
            ]
          },
          layout: {
            fillColor: (rowIndex) => rowIndex === 0 ? "#23527c" : rowIndex % 2 ? "#f3f7fa" : null,
            hLineWidth: (i, node) => i === 0 || i === node.table.body.length ? 2 : 1,
            vLineWidth: () => 1,
            hLineColor: () => "#bbb",
            vLineColor: () => "#bbb",
          },
          margin: [0, 0, 0, 24]
        },
        { text: "تفاصيل الحركات", style: "subheader", alignment: "right", margin: [0, 18, 0, 6] },
        {
          table: {
            headerRows: 1,
            widths: [65, 50, 90, 40, 40, 50, 60, "*"],
            body: [
              [
                { text: "التاريخ", style: "tableHeader", alignment: "center" },
                { text: "العملية", style: "tableHeader", alignment: "center" },
                { text: "اسم الصنف", style: "tableHeader", alignment: "center" },
                { text: "الكمية", style: "tableHeader", alignment: "center" },
                { text: "السعر", style: "tableHeader", alignment: "center" },
                { text: "القيمة", style: "tableHeader", alignment: "center" },
                { text: "الموظف", style: "tableHeader", alignment: "center" },
                { text: "ملاحظة", style: "tableHeader", alignment: "center" }
              ],
              ...(report.logs || []).map(log => [
                log.createdAt ? log.createdAt.slice(0, 10) : "-",
                log.type === "in" ? { text: "دخول", color: "#29a38b", bold: true } : { text: "خروج", color: "#d7263d", bold: true },
                log.fabric?.name ? `${log.fabric.name} (${log.fabric.code})` : "-",
                log.qty,
                log.cost || "-",
                log.qty * (log.cost || 0),
                log.employeeUsername || "-",
                log.note || "-"
              ])
            ]
          },
          layout: {
            fillColor: (rowIndex) => rowIndex === 0 ? "#23527c" : rowIndex % 2 ? "#f9fafb" : null,
            hLineWidth: (i, node) => i === 0 || i === node.table.body.length ? 2 : 1,
            vLineWidth: () => 1,
            hLineColor: () => "#d2dbe7",
            vLineColor: () => "#d2dbe7",
          },
          fontSize: 10
        }
      ],
      styles: {
        subheader: { fontSize: 13, bold: true, color: "#23527c", alignment: "right" },
        tableHeader: { fillColor: "#23527c", color: "#fff", bold: true, fontSize: 12, alignment: "center" }
      }
    };

    pdfMake.createPdf(docDefinition).download("stock-report.pdf");
  }

function exportToExcel() {
  if (!report) return;

  const allRows = [
    ["البيان", "الكمية", "القيمة (ريال)"],
    ["اجمالي الدخول", report.inQty, report.inValue],
    ["اجمالي الخروج", report.outQty, report.outValue],
    ["الرصيد خلال الفترة", report.balanceQty, report.balanceValue],
    ["رصيد المخزون الحالي", report.currentStock, ""],
    [],
    ["التاريخ", "العملية", "اسم الصنف", "الكمية", "السعر", "القيمة", "الموظف", "ملاحظة"],
    ...(report.logs || []).map(log => [
      log.createdAt ? log.createdAt.slice(0, 10) : "-",
      log.type === "in" ? "دخول" : "خروج",
      log.fabric?.name ? `${log.fabric.name} (${log.fabric.code})` : "-",
      log.qty,
      log.cost || "-",
      log.qty * (log.cost || 0),
      log.employeeUsername || "-",
      log.note || "-"
    ])
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(allRows);
  XLSX.utils.book_append_sheet(wb, ws, "تقرير المخزون");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), "stock-report.xlsx");
}

  return (
    <div style={{ padding: 32, direction: "rtl", maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 24 }}>تقرير حركة ورصيد المخزون</h2>
      <form onSubmit={fetchReport} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div>
            <label>من تاريخ:</label>
            <input type="date" value={start} onChange={e => setStart(e.target.value)} required />
          </div>
          <div>
            <label>إلى تاريخ:</label>
            <input type="date" value={end} onChange={e => setEnd(e.target.value)} required />
          </div>
          <div>
            <label>الصنف:</label>
            <select value={fabricId} onChange={e => setFabricId(e.target.value)}>
              <option value="all">كل المخزون</option>
              {fabrics.map(f => (
                <option key={f._id} value={f._id}>{f.name} ({f.code})</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" disabled={loading || !start || !end}>
          {loading ? "جاري التحميل..." : "عرض التقرير"}
        </button>
        {report && (
          <>
            <button
              type="button"
              style={{
                marginRight: 16,
                background: "#0055aa",
                color: "#fff",
                fontWeight: "bold",
                padding: "8px 18px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer"
              }}
              onClick={exportToPDF}
            >
              تحميل PDF
            </button>
            <button
              type="button"
              style={{
                marginRight: 16,
                background: "#1e944c",
                color: "#fff",
                fontWeight: "bold",
                padding: "8px 18px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer"
              }}
              onClick={exportToExcel}
            >
              تحميل Excel
            </button>
          </>
        )}
      </form>

      {msg && <div style={{ color: "red", marginBottom: 16 }}>{msg}</div>}

      {report && (
        <div style={{ border: "1px solid #444", padding: 24, borderRadius: 12, background: "#fafafa" }}>
          <table style={{ width: "100%", textAlign: "center", marginBottom: 16 }}>
            <thead>
              <tr>
                <th style={{ padding: 8 }}>البيان</th>
                <th style={{ padding: 8 }}>الكمية</th>
                <th style={{ padding: 8 }}>القيمة (ريال)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>اجمالي الدخول</td>
                <td>{report.inQty}</td>
                <td>{report.inValue}</td>
              </tr>
              <tr>
                <td>اجمالي الخروج</td>
                <td>{report.outQty}</td>
                <td>{report.outValue}</td>
              </tr>
              <tr style={{ fontWeight: "bold", background: "#eef" }}>
                <td>الرصيد خلال الفترة</td>
                <td>{report.balanceQty}</td>
                <td>{report.balanceValue}</td>
              </tr>
              <tr>
                <td>رصيد المخزون الحالي</td>
                <td colSpan={2}>{report.currentStock}</td>
              </tr>
            </tbody>
          </table>

          {/* تفاصيل حركة المخزون */}
          {report.logs && report.logs.length > 0 && (
            <div style={{
              border: "1px solid #888", padding: 10, marginTop: 24, borderRadius: 10, background: "#f9f9ff"
            }}>
              <h4 style={{ margin: 0, marginBottom: 10 }}>تفاصيل حركة المخزون</h4>
              <div style={{ maxHeight: 420, overflowY: "auto" }}>
                <table style={{ width: "100%", textAlign: "center", fontSize: 15 }}>
                  <thead style={{ background: "#eee" }}>
                    <tr>
                      <th>التاريخ</th>
                      <th>العملية</th>
                      <th>اسم الصنف</th>
                      <th>الكمية</th>
                      <th>سعر الوحدة</th>
                      <th>القيمة</th>
                      <th>الموظف</th>
                      <th>ملاحظة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.logs.map((log, i) => (
                      <tr key={i}>
                        <td>{log.createdAt ? log.createdAt.slice(0, 10) : "-"}</td>
                        <td style={{ color: log.type === "in" ? "#068" : "#a00", fontWeight: "bold" }}>
                          {log.type === "in" ? "دخول" : "خروج"}
                        </td>
                        <td>
                          {log.fabric?.name
                            ? `${log.fabric.name} (${log.fabric.code})`
                            : "-"}
                        </td>
                        <td>{log.qty}</td>
                        <td>{log.cost || "-"}</td>
                        <td>{log.qty * (log.cost || 0)}</td>
                        <td>{log.employeeUsername || "-"}</td>
                        <td>{log.note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 10, fontSize: 13, color: "#555" }}>
                  مجموع الحركات المعروضة: {report.logs.length}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
