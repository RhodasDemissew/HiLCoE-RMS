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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveLink("");
    }
  }, [location.pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  function handleNavClick(item) {
    setActiveLink(item.label);
    setIsMobileMenuOpen(false);
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

  // Show first 3 nav items on mobile, rest in menu
  const visibleNavItems = NAV.slice(0, 3);
  const hiddenNavItems = NAV.slice(3);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-muted">
      <Container className="h-16 flex items-center justify-between relative">
        <Logo />

        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-2 md:gap-4 lg:gap-6 xl:gap-8">
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

        {/* Desktop Login/Sign Up - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-1 md:gap-2 lg:gap-3">
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

        {/* Mobile Menu Button - Only visible on mobile */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-[color:var(--neutral-700)] hover:text-[color:var(--brand-600)] focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Menu Dropdown */}
        <div
          className={`absolute top-full left-0 right-0 bg-white border-b border-muted shadow-lg z-50 md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <nav className="flex flex-col py-2">
            {NAV.map((item) => {
              if (item.href.startsWith("#")) {
                const isAnchorActive = isLanding && activeLink === item.label;
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    className={`px-4 py-3 text-left text-sm font-medium text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-50)] hover:text-[color:var(--brand-600)] transition-colors ${
                      isAnchorActive ? "bg-[color:var(--brand-50)] text-[color:var(--brand-600)] font-semibold" : ""
                    }`}
                  >
                    {item.label}
                  </button>
                );
              }

              const isRouteActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 text-left text-sm font-medium text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-50)] hover:text-[color:var(--brand-600)] transition-colors ${
                    isRouteActive ? "bg-[color:var(--brand-50)] text-[color:var(--brand-600)] font-semibold" : ""
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t border-[color:var(--neutral-200)] mt-2 pt-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-semibold text-[color:var(--brand-600)] hover:bg-[color:var(--neutral-50)] transition-colors"
              >
                Login
              </Link>
              {onSignUp ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onSignUp();
                  }}
                  className="block w-full text-left px-4 py-3 text-sm font-semibold text-[color:var(--brand-600)] hover:bg-[color:var(--neutral-50)] transition-colors"
                >
                  Sign Up
                </button>
              ) : (
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-semibold text-[color:var(--brand-600)] hover:bg-[color:var(--neutral-50)] transition-colors"
                >
                  Sign Up
                </Link>
              )}
            </div>
          </nav>
        </div>
      </Container>
    </header>
  );
}

