import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminApp from "./admin/AdminApp";
import StaffApp from "./staff/StaffApp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/staff/*" element={<StaffApp />} />
        <Route
          path="*"
          element={
            <div style={{ textAlign: "center", marginTop: 100, fontSize: 24 }}>
              🚫 الصفحة غير موجودة <br />
              <a href="/" style={{ color: "#19ad5b" }}>العودة للصفحة الرئيسية</a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
