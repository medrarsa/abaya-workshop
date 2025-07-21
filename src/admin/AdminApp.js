import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
// صفحات الإدارة (فرغهم مؤقتًا أو اعمل صفحات بداية)
import DashboardPage from "./pages/DashboardPage";
import UploadOrdersPage from "./pages/UploadOrdersPage";
import EmployeesPage from "./pages/EmployeesPage";
import StagesPage from "./pages/StagesPage";
import InventoryPage from "./pages/InventoryPage";
import OrdersPage from "./pages/OrdersPage";
import ReportsPage from "./pages/ReportsPage";
import UploadModelsPage from "./pages/UploadModelsPage";
import PrintOrdersPage from "./pages/PrintOrdersPage";
import StockReportPage from "./pages/StockReportPage";
import StagesDashboardPage from "./pages/StagesDashboardPage";
import AddPaymentPage from "./pages/AddPaymentPage";
import StockLogPage from "./pages/StockLogPage";
       
 
export default function AdminApp() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="upload-orders" element={<UploadOrdersPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="stages" element={<StagesPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="upload-models" element={<UploadModelsPage />} />
          <Route path="print-orders" element={<PrintOrdersPage />} />
           <Route path="stages-dashboard" element={<StagesDashboardPage />} />
            <Route path="add-payment" element={<AddPaymentPage />} />
          <Route path="stock-repor" element={<StockReportPage />} />
 


 
<Route path="/admin/stock-log" element={<StockLogPage />} />
<Route path="/admin/stock-log/:id" element={<StockLogPage />} />

      </Route>
    </Routes>
  );
}
