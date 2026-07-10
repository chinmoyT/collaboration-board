import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { OrganizationsPage } from "./pages/OrganizationsPage";
import { OrgBoardsPage } from "./pages/OrgBoardsPage";
import { BoardPage } from "./pages/BoardPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/organizations"
        element={
          <ProtectedRoute>
            <OrganizationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizations/:orgId"
        element={
          <ProtectedRoute>
            <OrgBoardsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizations/:orgId/boards/:boardId"
        element={
          <ProtectedRoute>
            <BoardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/organizations" replace />} />
    </Routes>
  );
}
