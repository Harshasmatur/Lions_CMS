import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { ProtectedRoute, PublicOnlyRoute } from "@/routes/ProtectedRoute";
import { Toaster } from "@/components/ui/toast";

import LoginPage from "@/features/auth/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import NewsListPage from "@/features/news/pages/NewsListPage";
import NewsEditorPage from "@/features/news/pages/NewsEditorPage";
import EventsListPage from "@/features/events/pages/EventsListPage";
import EventEditorPage from "@/features/events/pages/EventEditorPage";

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/news" element={<NewsListPage />} />
            <Route path="/news/:id" element={<NewsEditorPage />} />
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/:id" element={<EventEditorPage />} />
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}
