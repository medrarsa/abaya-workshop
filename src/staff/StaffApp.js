import { Routes, Route } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import StaffLayout from "./layouts/StaffLayout";
import WalletPage from "./pages/WalletPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import ScanOrderPage from "./pages/ScanOrderPage";
import SalaryPage from "./pages/SalaryPage";
import ProfilePage from "./pages/ProfilePage";
import AddPhonePage from "./pages/AddPhonePage";

export default function StaffApp() {
  return (
    <Routes>
      <Route element={<StaffLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="wallet" element={<WalletPage />} />
        <Route path="orders" element={<MyOrdersPage />} />
        <Route path="scan" element={<ScanOrderPage />} />
        <Route path="salary" element={<SalaryPage />} />
        <Route path="profile" element={<ProfilePage />} />
      <Route path="add-phone" element={<AddPhonePage />} />
      </Route>
    </Routes>
  );
}





  