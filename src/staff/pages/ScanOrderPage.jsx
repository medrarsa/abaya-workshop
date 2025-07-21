// src/staff/pages/ScanOrderPage.jsx
import React, { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
const BASE_URL = process.env.REACT_APP_API_URL;

const employee = JSON.parse(localStorage.getItem("user") || "{}");
const USER_JOB_TYPE = employee.jobType || "";
const EMPLOYEE_ID = employee._id || employee.id || "";

export default function ScanOrderPage() {
  const [barcode, setBarcode] = useState("");
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [showScanner, setShowScanner] = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [inputBarcode, setInputBarcode] = useState("");
  const [executed, setExecuted] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");
  const [steps, setSteps] = useState([]);
  const [executing, setExecuting] = useState(false); // متغير شاشة التحميل أثناء التنفيذ

  useEffect(() => {
    if (!showScanner) return;
    let instance = new Html5Qrcode("reader");
    instance.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 280, height: 280 } },
      async (decodedText) => {
        handleFetch(decodedText);
        setShowScanner(false);
        try { instance.stop(); } catch {}
        try { instance.clear(); } catch {}
      }
    ).catch(() => setError("لم يتم تشغيل الكاميرا!"));
    return () => {
      try { instance.stop(); } catch {}
      try { instance.clear(); } catch {}
    };
    // eslint-disable-next-line
  }, [showScanner]);

  async function handleFetch(barcodeValue) {
    setBarcode(barcodeValue);
    setError("");
    setItem(null);
    setExecuted(false);
    setPopupMsg("");
    setSteps([]);
    if (!barcodeValue) return;
    const res = await fetch(`${BASE_URL}/api/orderitems/by-barcode/${barcodeValue}`);
    const data = await res.json();
    if (!data || data.error) {
      setError(data?.error || "لم يتم العثور على القطعة أو الطلب");
      return;
    }
    setItem(data);
    // جلب خطوات التنفيذ
    const resSteps = await fetch(`${BASE_URL}/api/orderitemsteps/byOrderItem/${data._id || data.barcode}`);
    const stepsData = await resSteps.json();
    setSteps(Array.isArray(stepsData) ? stepsData : []);
    if (Array.isArray(stepsData)) {
      const stepDone = stepsData.find(s => s.stepName === USER_JOB_TYPE && s.status === "منجز");
      if (stepDone) {
        let nextStage = "";
        setPopupMsg(
          `ℹ️لقد تم تنفيذ طلب ${USER_JOB_TYPE} لهذا الطلب. تم تنفيذ مرحلة "${USER_JOB_TYPE}" في تاريخ ${stepDone.receivedAt ? new Date(stepDone.receivedAt).toLocaleString('ar-EG') : '-'}.
${nextStage ? `المرحلة التالية للطلب هي "${nextStage}".` : ""}`
        );
        setExecuted(true);
      }
    }
  }

  function getMyPrice(item) {
    if (!item) return 0;
    if (USER_JOB_TYPE === "قصاص") return Number(item.cutPrice) || 0;
    if (USER_JOB_TYPE === "خياط") return Number(item.sewPrice) || 0;
    if (USER_JOB_TYPE === "كواية") return Number(item.ironPrice) || 0;
    if (USER_JOB_TYPE === "مطرز") return Number(item.embPrice) || 0;
    if (USER_JOB_TYPE === "مركب أزرار") return Number(item.buttonPrice) || 0;
    if (USER_JOB_TYPE === "موظف الشحن") return Number(item.shipping) || 0;
    return 0;
  }

  async function handleExecute() {
    setError("");
    setPopupMsg("");
    setExecuting(true); // بداية شاشة التحميل

    const orderItemId = item.barcode || "";
    if (!orderItemId) {
      setError("رقم القطعة غير معروف! تحقق من الرد من السيرفر.");
      setExecuting(false); // إنهاء شاشة التحميل عند الخطأ
      return;
    }
    if (!EMPLOYEE_ID) {
      setError("رقم الموظف غير معروف!");
      setExecuting(false);
      return;
    }
    const res = await fetch(`${BASE_URL}/api/orderitemsteps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderItem: orderItemId,
        stepName: USER_JOB_TYPE,
        employee: EMPLOYEE_ID,
        amount: getMyPrice(item),
        notes: ""
      })
    });
    const data = await res.json();
    setExecuting(false); // إنهاء شاشة التحميل بعد الاستجابة

    if (data.error) {
      if (data.error.startsWith("لقد تم تنفيذ طلب")) {
        setPopupMsg(data.error);
        setExecuted(true);
      } else {
        setError(data.error);
      }
    } else {
      setExecuted(true);
      alert("تم تنفيذ المرحلة وتسجيل الرصيد! ✅");
    }
  }

  return (
    <div style={{
      padding: 30, textAlign: "center", minHeight: "calc(100vh - 120px)"
    }}>
      {/* شاشة التحميل عند تنفيذ الأمر */}
      {executing && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(255,255,255,0.82)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          fontSize: 27,
          fontWeight: 900,
          color: "#2563eb",
          letterSpacing: 1,
          fontFamily: "Tajawal, Arial"
        }}>
          <div style={{
            width: 54, height: 54, border: "6px solid #dbeafe",
            borderTop: "6px solid #2563eb", borderRadius: "50%",
            marginBottom: 18, animation: "spin 1.2s linear infinite"
          }} />
          جاري تنفيذ الأمر...
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg);}
              100% { transform: rotate(360deg);}
            }
          `}</style>
        </div>
      )}

      <h1 style={{marginBottom: 24, fontWeight: 700}}>سكان باركود QR <span style={{fontSize:20, color:"#666"}}>(تنفيذ حسب المرحلة)</span></h1>
      <div style={{marginBottom: 10}}>
        <button
          style={{marginRight: 8}}
          onClick={() => { setShowScanner(true); setShowManual(false); setItem(null); setBarcode(""); setError(""); setExecuted(false); setPopupMsg(""); }}
        >سكان بالكاميرا</button>
        <button
          onClick={() => { setShowManual(true); setShowScanner(false); setItem(null); setBarcode(""); setError(""); setExecuted(false); setPopupMsg(""); }}
        >إدخال يدوي</button>
      </div>
      {showScanner && (
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          width: 320, height: 320, background: "#e3e6ea", borderRadius: 18, margin: "0 auto"
        }}>
          <div id="reader"
            style={{ width: 280, height: 280, background: "#222", borderRadius: 12 }}
          ></div>
        </div>
      )}
      {showManual && (
        <div style={{margin: "24px 0"}}>
          <input
            value={inputBarcode}
            onChange={e => setInputBarcode(e.target.value)}
            placeholder="أدخل الباركود هنا"
            style={{padding: "12px 18px", borderRadius: 10, border: "1.5px solid #aaa", width: 250, fontSize: 18, textAlign: "center"}}
          />
          <button
            style={{marginRight: 12, background:"#008080", color:"#fff", border:"none", borderRadius:8, fontWeight:700, fontSize:18, padding:"10px 22px"}}
            onClick={() => handleFetch(inputBarcode)}
          >بحث</button>
        </div>
      )}

      <div style={{marginTop: 18, color: "#333"}}>
        <b>الباركود المقروء:</b>
        <div style={{ margin: "8px 0", color: "#19ad5b", fontWeight:700 }}>
          {barcode || <span style={{ color: "#999" }}>لم يتم المسح بعد</span>}
        </div>
        {error && <div style={{ color: "red", margin: "10px auto", fontWeight:700 }}>{error}</div>}
      </div>

      {/* رسالة البوب اب (المراحل المنفذة) */}
      {popupMsg && (
        <div style={{
          color:"#a81b1b",
          fontWeight:700,
          margin:"18px auto 18px",
          background:"#fee",
          border:"2px solid #ff7575",
          padding:"16px",
          borderRadius:"9px",
          fontSize:17,
          boxShadow:"0 4px 20px #fba5a533",
          width:"95%",
          maxWidth:"550px"
        }}>
          <span role="img" aria-label="info" style={{fontSize: 22, marginLeft: 8}}>ℹ️</span>
          {popupMsg}
        </div>
      )}

      {item && (
        <div className="card-info" style={{
          margin: "32px auto 0", width: 430, background: "#fff", borderRadius: 18, boxShadow: "0 4px 16px #0001", padding: 20, textAlign:"right"
        }}>
          <div style={{fontSize:16, marginBottom:12}}>
            <b>اسم العميل:</b> {item.customer} <br/>
            <b>رقم الطلب:</b> {item.orderNumber} <br/>
            <b>تاريخ الطلب:</b> {item.orderDate} <br/>
            <b>المدينة:</b> {item.city}
          </div>
          <div style={{display: "flex", alignItems: "center", marginBottom: 12}}>
            <div style={{
              width: 110, height: 140, background: "#f4f4f4", borderRadius: 10,
              display:"flex", alignItems:"center", justifyContent:"center", marginLeft: 18
            }}>
              {item.imageUrl
                ? <img src={item.imageUrl} alt="صورة الموديل" style={{width:"100%", height:"100%", borderRadius: 10, objectFit:"cover"}} />
                : <span style={{color:"#aaa"}}>لا توجد صورة</span>}
            </div>
            <div style={{flex:1, fontSize:17, fontWeight:700}}>
              <div>الموديل: <span style={{fontWeight:900}}>{item.modelCode}</span></div>
              <div>المتر المطلوب: {item.metersNeeded || "-"}</div>
              <div>نوع القماش: {item.fabricType || "-"} </div>
              <div>اسم القماش: {item.fabricName || "-"} </div>
              <div>كمية المخزون الحالي: {item.currentStock || "-"} متر</div>
              <div>سعر متر القماش: {item.unitPrice || "-"} ريال</div>
            </div>
          </div>
          <div style={{fontSize:16, margin:"10px 0"}}>
            <b>المقاس:</b> {item.size || "-"} <br/>
            <b>الملاحظات:</b> {item.notes || "-"}
          </div>
          <div style={{fontSize:17, fontWeight:700, margin:"18px 0 10px", color:"#19ad5b"}}>
            سعر الخدمة: <b>{getMyPrice(item)} ريال</b>
          </div>

          {/* لا يظهر زر التنفيذ إذا كان الموظف مطرز وسعر التطريز صفر */}
          {(USER_JOB_TYPE === "مطرز" && getMyPrice(item) === 0) ? (
            <div style={{
              color:"#a81b1b",
              fontWeight:700,
              margin:"18px 0 0",
              background:"#fee",
              border:"2px solid #ff7575",
              padding:"16px",
              borderRadius:"9px",
              fontSize:17,
              boxShadow:"0 4px 20px #fba5a533"
            }}>
              <span role="img" aria-label="info" style={{fontSize: 22, marginLeft: 8}}>ℹ️</span>
              هذا الطلب لا يحتاج إلى مرحلة تطريز<br />
              لا يمكنك تنفيذ التطريز لهذا الطلب.
            </div>
          ) : (
            (!popupMsg && !executed) && (
              <button
                onClick={handleExecute}
                className="main-action"
                style={{
                  marginTop:18,
                  background:"#19ad5b",
                  color:"#fff",
                  border:"none",
                  borderRadius:9,
                  fontSize:18,
                  padding:"13px 40px",
                  fontWeight:900
                }}
              >
                ابدأ التنفيذ (سعر: {getMyPrice(item)} ريال)
              </button>
            )
          )}

          {/* رسالة نجاح */}
          {executed && !popupMsg && (
            <div style={{marginTop:18, color:"green", fontWeight:"bold", fontSize:16}}>
              ✅ تم تنفيذ المرحلة وحفظ الرصيد للموظف!
            </div>
          )}

        </div>
      )}
    </div>
  );
}
