import React, { useState } from "react";
import * as XLSX from "xlsx";
const BASE_URL = process.env.REACT_APP_API_URL;
function UploadModelsPage() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [msg, setMsg] = useState("");

  // قراءة ملف إكسل
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
      setColumns(jsonData[0] || []);
      setData(jsonData.slice(1));
      setMsg("تم قراءة الموديلات وجاهزة للرفع!");
    };
    reader.readAsBinaryString(file);
  };

  // رفع الموديلات للباك إند مع التحويل الصحيح للأعمدة المطلوبة
  const handleSend = async () => {
    const formatted = data.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        // تحويل اسم العمود من العربي إلى الإنجليزي (code, name)
        if (col === "رقم الموديل") obj["code"] = row[i];
        else if (col === "نوع القماش") obj["fabricType"] = row[i];
        else if (col === "اسم الموديل") obj["name"] = row[i];
        else if (col === "رابط صورة الموديل") obj["imageUrl"] = row[i];
        else if (col === "ياخذ") obj["metersNeeded"] = row[i];
        else if (col === "سعر القص") obj["cutPrice"] = row[i];
        else if (col === "سعر الخياطة") obj["sewPrice"] = row[i];
        else if (col === "سعر الكواية") obj["ironPrice"] = row[i];
        else if (col === "سعر التطريز") obj["embPrice"] = row[i];
        else if (col === "سعر الأزرار") obj["buttonPrice"] = row[i];
        else if (col === "الشحن") obj["shipping"] = row[i];
        else if (col === "احتياطي1") obj["reserve1"] = row[i];
        else if (col === "احتياطي2") obj["reserve2"] = row[i];
        else if (col === "احتياطي3") obj["reserve3"] = row[i];
        else if (col === "احتياطي4") obj["reserve4"] = row[i];
        else if (col === "احتياطي5") obj["reserve5"] = row[i];
        else if (col === "احتياطي6") obj["reserve6"] = row[i];
        else obj[col] = row[i]; // لو فيه عمود زيادة احتفظ به كما هو
      });
      return obj;
    });
    const res = await fetch(`${BASE_URL}/api/abayamodels/bulk-upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ models: formatted })
    });
    const result = await res.json();
    if (result.error) setMsg("خطأ: " + result.error);
    else setMsg("تم رفع كل الموديلات بنجاح (" + (result.count || 0) + " موديل)!");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>رفع الموديلات مع الأسعار من إكسل</h1>
      <div style={{ margin: "0 0 16px" }}>
        <b>الأعمدة المطلوبة بالترتيب:</b>
        <ul>
          <li>رقم الموديل</li>
          <li>نوع القماش</li>
          <li>ياخذ</li>
          <li>سعر القص</li>
          <li>سعر الخياطة</li>
          <li>سعر الكواية</li>
          <li>سعر التطريز</li>
          <li>سعر الأزرار</li>
          <li>الشحن</li>
          <li>احتياطي1</li>
          <li>احتياطي2</li>
          <li>احتياطي3</li>
          <li>احتياطي4</li>
          <li>احتياطي5</li>
          <li>احتياطي6</li>
        </ul>
      </div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFile} />
      {msg && <div style={{ margin: "16px 0", color: msg.startsWith("خطأ") ? "red" : "green" }}>{msg}</div>}
      {data.length > 0 && (
        <>
          <button onClick={handleSend} style={{ margin: "16px 0", padding: "8px 20px" }}>رفع جميع الموديلات</button>
          <table border="1" cellPadding={8} style={{ marginTop: 20, background: "#fff" }}>
            <thead>
              <tr>
                {columns.map((col, i) => <th key={i}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  {row.map((cell, i) => (
                    <td key={i}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default UploadModelsPage;
