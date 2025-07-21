import React, { useState } from "react";
import * as XLSX from "xlsx";
const BASE_URL = process.env.REACT_APP_API_URL;
// دالة تحويل رقم إكسل لتاريخ مقروء
function excelDateToJSDate(serial) {
  if (typeof serial !== "number" || serial < 30000 || serial > 50000) return serial;
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);

  // استخراج الوقت من الجزء العشري
  const fractional_day = serial - Math.floor(serial) + 0.0000001;
  let totalSeconds = Math.floor(86400 * fractional_day);
  const seconds = totalSeconds % 60;
  totalSeconds -= seconds;
  const hours = Math.floor(totalSeconds / (60 * 60));
  const minutes = Math.floor((totalSeconds - (hours * 60 * 60)) / 60);

  return (
    date_info.getFullYear() +
    "-" +
    String(date_info.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date_info.getDate()).padStart(2, "0") +
    " " +
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0")
  );
}

function UploadOrdersPage() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [msg, setMsg] = useState("");
  const [groupDate, setGroupDate] = useState(new Date().toISOString().slice(0, 10));
  const [groupNumber, setGroupNumber] = useState(1);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });

      // تصحيح التواريخ لأي رقم تسلسلي
      const fixedData = jsonData.slice(1).map(row =>
        row.map(cell => excelDateToJSDate(cell))
      );

      setColumns(jsonData[0] || []);
      setData(fixedData);
      setMsg("تم قراءة البيانات وجاهزة للرفع!");
    };
    reader.readAsBinaryString(file);
  };

  // إرسال البيانات للباك إند مع بيانات المجموعة
  const handleSend = async () => {
    const formatted = data.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      obj.groupDate = groupDate;
      obj.groupNumber = groupNumber;
      return obj;
    });
    const res = await fetch(`${BASE_URL}/api/orders/bulk-upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders: formatted })
    });
    const result = await res.json();
    if (result.error) setMsg("خطأ: " + result.error);
    else setMsg("تم رفع كل الطلبات بنجاح (" + (result.count || result.items || 0) + " طلب)!");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>رفع الطلبات من إكسل</h1>
      <div style={{ margin: "16px 0" }}>
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
            onChange={e => setGroupNumber(Number(e.target.value))}
            style={{ width: 60, margin: "0 8px" }}
          />
        </label>
      </div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFile} />
      {msg && <div style={{ margin: "16px 0", color: msg.startsWith("خطأ") ? "red" : "green" }}>{msg}</div>}
      {data.length > 0 && (
        <>
          <button onClick={handleSend} style={{ margin: "16px 0", padding: "8px 20px" }}>رفع جميع الطلبات</button>
          <table border="1" cellPadding={8} style={{ marginTop: 20, background: "#fff" }}>
            <thead>
              <tr>
                {columns.map((col, i) => <th key={i}>{col}</th>)}
                <th>تاريخ المجموعة</th>
                <th>رقم المجموعة</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  {row.map((cell, i) => (
                    <td key={i}>{cell}</td>
                  ))}
                  <td>{groupDate}</td>
                  <td>{groupNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default UploadOrdersPage;
