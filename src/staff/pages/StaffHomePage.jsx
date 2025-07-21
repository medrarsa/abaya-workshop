// src/staff/pages/StaffHomePage.jsx
import StaffLayout from "../layouts/StaffLayout";

export default function StaffHomePage() {
  return (
    <StaffLayout>
      <div style={{ textAlign: "center", marginTop: 40 }}>
        الرصيد الحالي: <span style={{ color: "#19ad5b", fontWeight: "bold" }}>425 ريال</span>
      </div>
    </StaffLayout>
  );
}
