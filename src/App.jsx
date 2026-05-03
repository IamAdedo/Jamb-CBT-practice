import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/shared/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import SubjectSelectionPage from "./pages/SubjectSelectionPage";
import ExamPage from "./pages/ExamPage";
import ResultsPage from "./pages/ResultsPage";
import AdminPage from "./pages/admin/AdminPage";

export default function App() {
  useAuth(); // bootstraps session on load

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={
          <ProtectedRoute><SubjectSelectionPage /></ProtectedRoute>
        } />

        <Route path="/exam" element={
          <ProtectedRoute><ExamPage /></ProtectedRoute>
        } />

        <Route path="/results" element={
          <ProtectedRoute><ResultsPage /></ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
