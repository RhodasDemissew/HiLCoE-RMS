import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "../shared/contexts/ThemeContext.jsx";
import Landing from "../features/landing/pages/Landing.jsx";
import Verify from "../features/auth/pages/Verify.jsx";
import SignUp from "../features/auth/pages/SignUp.jsx";
import Login from "../features/auth/pages/Login.jsx";
import ForgotPassword from "../features/auth/pages/ForgotPassword.jsx";
import Reset from "../features/auth/pages/Reset.jsx";
import Faq from "../features/site/pages/Faq.jsx";
import Contact from "../features/site/pages/Contact.jsx";
import ResearcherDashboard from "../features/researchDashboard/pages/Dashboard.jsx";
import CoordinatorDashboard from "../features/coordinatorDashboard/pages/Dashboard.jsx";
import SupervisorDashboard from "../features/supervisorDashboard/pages/Dashboard.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/contact" element={<Contact />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/researcher" element={<ResearcherDashboard />} />
          <Route path="/coordinator" element={<CoordinatorDashboard />} />
          <Route path="/supervisor" element={<SupervisorDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}


