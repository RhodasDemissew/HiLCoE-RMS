import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Container from "../ui/Container.jsx";
import logoImage from "../../../assets/images/logo.png";
import { NAV } from "../../../features/landing/content.js";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 md:gap-3">
      <img
        src={logoImage}
        alt="HiLCoE logo"
        className="h-8 w-8 md:h-10 md:w-10 rounded-full"
        loading="eager"
        decoding="async"
      />
      <div className="flex flex-col items-center font-caprasimo leading-tight">
        <div className="text-sm md:text-base text-[var(--brand-600)] font-semibold">HiLCoE</div>
        <div className="text-xs md:text-sm text-[color:var(--brand-600)]/80 hidden sm:block">
          School Research Management System
        </div>
      </div>
    </Link>
  );
}

export default function Header({ onSignUp }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState("Home");

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveLink("");
    }
  }, [location.pathname]);

  function handleNavClick(item) {
    setActiveLink(item.label);
    if (item.href.startsWith("#")) {
      if (location.pathname !== "/") {
        navigate("/", { state: { scrollTo: item.href } });
      } else {
        const el = document.querySelector(item.href);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }

  const isLanding = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-muted">
      <Container className="h-16 flex items-center justify-between">
        <Logo />

        {/* Navigation - Responsive */}
        <nav className="flex items-center gap-2 md:gap-4 lg:gap-6 xl:gap-8">
          {NAV.map((item) => {
            if (item.href.startsWith("#")) {
              const isAnchorActive = isLanding && activeLink === item.label;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className={[
                    "medium text-xs md:text-sm xl:text-base hover:text-heading transition-colors relative whitespace-nowrap",
                    isAnchorActive ? "font-bold text-heading" : "",
                  ].join(" ")}
                >
                  {item.label}
                  <span
                    className={`absolute left-0 right-0 bottom-[-2px] h-[2px] bg-[color:var(--brand-600)] transition-transform ${
                      isAnchorActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  ></span>
                </button>
              );
            }

            const isRouteActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={[
                  "medium text-xs md:text-sm xl:text-base hover:text-heading transition-colors relative whitespace-nowrap",
                  isRouteActive ? "font-semibold text-heading" : "",
                ].join(" ")}
              >
                {item.label}
                <span
                  className={`absolute left-0 right-0 bottom-[-2px] h-[2px] bg-[color:var(--brand-600)] transition-transform ${
                    isRouteActive ? "scale-x-100" : "scale-x-0"
                  }`}
                ></span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 md:gap-2 lg:gap-3">
          <Link
            to="/login"
            className="medium text-xs md:text-sm lg:text-base font-semibold text-[color:var(--brand-600)] hover:opacity-90 whitespace-nowrap"
          >
            Login
          </Link>
          {onSignUp ? (
            <button
              type="button"
              onClick={onSignUp}
              className="btn small rounded-btn text-xs md:text-sm px-2 md:px-3 lg:px-4 py-1 md:py-2 whitespace-nowrap"
            >
              Sign Up
            </button>
          ) : (
            <Link to="/signup" className="btn small rounded-btn text-xs md:text-sm px-2 md:px-3 lg:px-4 py-1 md:py-2 whitespace-nowrap">
              Sign Up
            </Link>
          )}
        </div>
      </Container>
    </header>
  );
}

