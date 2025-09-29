import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "../features/landing/pages/Landing.jsx";
import Verify from "../features/auth/pages/Verify.jsx";
import SignUp from "../features/auth/pages/SignUp.jsx";
import Login from "../features/auth/pages/Login.jsx";
import Faq from "../features/site/pages/Faq.jsx";
import Contact from "../features/site/pages/Contact.jsx";
import ResearcherDashboard from "../features/researchDashboard/pages/Dashboard.jsx";
import CoordinatorDashboard from "../features/coordinatorDashboard/pages/Dashboard.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/contact" element={<Contact />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/researcher" element={<ResearcherDashboard />} />
        <Route path="/coordinator" element={<CoordinatorDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


