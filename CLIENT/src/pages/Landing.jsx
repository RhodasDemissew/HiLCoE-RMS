import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Hero from "../components/sections/Hero";
import SearchPanel from "../components/sections/SearchPanel";
import Features from "../components/sections/landing/Features";
import About from "../components/sections/landing/About";
import Roadmap from "../components/sections/landing/Roadmap";
import Footer from "../components/layout/Footer";

export default function Landing({ onShowVerify }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const target = location.state?.scrollTo;
    if (target) {
      const el = document.querySelector(target);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 50);
      }
    }
  }, [location.state]);

  const handleVerify = useCallback(() => {
    if (onShowVerify) {
      onShowVerify();
    } else {
      navigate("/verify");
    }
  }, [navigate, onShowVerify]);

  return (
    <>
      <Header onSignUp={handleVerify} />
      <main id="main">
        <Hero onSignUp={handleVerify} />
        <SearchPanel />
        <Features />
        <About />
        <Roadmap />
        <Footer />
      </main>
    </>
  );
}
