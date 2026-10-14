import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./pages/Home";
import Consult from "./pages/Consult";
import FindDoctor from "./pages/FindDoctor";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Downloads from "./pages/Downloads";
import Auth from "./pages/Auth";
import Pharmacy from "./pages/Pharmacy";
import { VoiceProvider } from "./context/VoiceContext";

function App() {
  return (
    <VoiceProvider>
      <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="auth" element={<Auth />} />
      </Route>

      {/* Protected Main Routes */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Home />} />
        <Route path="consult" element={<Consult />} />
        <Route path="find-doctor" element={<FindDoctor />} />
        <Route path="profile" element={<Profile />} />
        <Route path="downloads" element={<Downloads />} />
        <Route path="pharmacy" element={<Pharmacy />} />
        <Route path="about" element={<About />} />
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </VoiceProvider>
  );
}

export default App;
