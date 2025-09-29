import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../shared/components/layout/Header.jsx";
import Hero from "../components/Hero.jsx";
import SearchPanel from "../components/SearchPanel.jsx";
import Features from "../components/Features.jsx";
import About from "../components/About.jsx";
import Roadmap from "../components/Roadmap.jsx";
import Footer from "../../../shared/components/layout/Footer.jsx";

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

