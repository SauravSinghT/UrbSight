import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Home from "./pages/Home";

import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import ComplaintForm from "./pages/ComplaintForm";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ComplaintList from "./pages/ComplaintList";
import AdminComplaints from "./pages/AdminComplaints";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <>
    <Navbar />
    <Routes>
      <Route path="/admin/complaints" element={
  <ProtectedRoute role={["admin", "super-admin", "group-admin", "block-admin"]}>
    <ComplaintList />
  </ProtectedRoute>
} />

      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/logout" element={<Logout />} />


      {/* User Routes */}
      <Route path="/user" element={
        <ProtectedRoute role="user">
          <UserDashboard />
        </ProtectedRoute>
      } />
      <Route path="/submit" element={
        <ProtectedRoute role="user">
          <ComplaintForm />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/complaints" element={
        <ProtectedRoute role="admin">
          <ComplaintList />
        </ProtectedRoute>
      } />
    </Routes>
    </>
  );
  
}

export default App;
