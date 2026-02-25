import { Route, Routes, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import { ProtectedRoute } from "../utilitis/ProtectedRoute";
import UserManagement from "../pages/admin/UserManagement";
import JobsManagement from "../pages/admin/JobsManagement";
import JobDetail from "../pages/admin/JobDetail";
import MasterTable from "../pages/admin/MasterTable";
import KuisonerManage from "../pages/admin/KuisonerManage";
import LupaPass from "../pages/LupaPass";
import Register from "../pages/register/Register";
import { useAuth } from "../context/AuthContext";
import Logout from "../pages/Logout";
import TambahPertanyaan from "../pages/admin/TambahKuesioner";
import LihatJawaban from "../pages/admin/LihatJawaban";
import LihatJawabanDetail from "../pages/admin/LihatJawabanDetail";
import StatusKarir from "../pages/admin/StatusKarir";
import NotFound from "../pages/NotFound";

export default function AppRouter() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={isAdmin ? "/wb-admin" : "/"} /> : <Login />} />
      <Route path="/reset-password" element={<LupaPass />} />
      <Route path="/logout" element={<Logout /> } />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
      <Route path="/wb-admin" element={
        <ProtectedRoute isAllowed={isAuthenticated && isAdmin} redirectTo="/login" />
      }>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="manage-user" >
            <Route index element={ <UserManagement /> } />
          </Route>
          <Route path="jobs">
            <Route index element={<JobsManagement />} />
            <Route path="job-detail/:id" element={<JobDetail />} />
          </Route>
          <Route path="status-karir">
            <Route index element={<StatusKarir />} />
          </Route>
          <Route path="master" element={<MasterTable />} />
          <Route path="kuisoner">
            <Route index element={<KuisonerManage />} />
            <Route path="tambah-pertanyaan" element={<TambahPertanyaan />} />
            <Route path="lihat-jawaban" > 
              <Route index element={<LihatJawaban />} />
              <Route path="detail/:id" element={<LihatJawabanDetail />} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="/" element={isAuthenticated ? <div className="p-8 text-center"><h1 className="text-2xl font-bold text-primary">Selamat Datang, Alumni!</h1><p className="text-third mt-2">Halaman alumni akan segera hadir.</p></div> : <Navigate to="/login" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
