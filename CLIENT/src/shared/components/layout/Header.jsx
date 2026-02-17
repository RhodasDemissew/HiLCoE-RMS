import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Container from "../ui/Container.jsx";
import logoImage from "../../../assets/images/logo.png";
import { NAV } from "../../../features/landing/content.js";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
      <img
        src={logoImage}
        alt="HiLCoE logo"
        className="h-8 w-8 md:h-10 md:w-10 rounded-full flex-shrink-0"
        loading="eager"
        decoding="async"
      />
      <div className="flex flex-col items-start font-caprasimo leading-tight">
        <div className="text-sm md:text-base text-[var(--brand-600)] font-semibold whitespace-nowrap">HiLCoE</div>
        <div className="text-xs md:text-sm text-[color:var(--brand-600)]/80 hidden sm:block whitespace-nowrap">
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveLink("");
    }
  }, [location.pathname]);

  function handleNavClick(item) {
    setActiveLink(item.label);
    setIsMenuOpen(false);
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
  
  // Show first 3 nav items, rest in menu
  const visibleNavItems = NAV.slice(0, 3);
  const menuNavItems = NAV.slice(3);

  function NavItem({ item }) {
    if (item.href.startsWith("#")) {
      const isAnchorActive = isLanding && activeLink === item.label;
      return (
        <button
          type="button"
          onClick={() => handleNavClick(item)}
          className={[
            "medium text-xs md:text-sm xl:text-base hover:text-heading transition-colors relative whitespace-nowrap px-2 py-1",
            isAnchorActive ? "font-bold text-heading" : "",
          ].join(" ")}
        >
          {item.label}
          <span
            className={`absolute left-2 right-2 bottom-0 h-[2px] bg-[color:var(--brand-600)] transition-transform ${
              isAnchorActive ? "scale-x-100" : "scale-x-0"
            }`}
          ></span>
        </button>
      );
    }

    const isRouteActive = location.pathname === item.href;
    return (
      <Link
        to={item.href}
        onClick={() => setIsMenuOpen(false)}
        className={[
          "medium text-xs md:text-sm xl:text-base hover:text-heading transition-colors relative whitespace-nowrap px-2 py-1",
          isRouteActive ? "font-semibold text-heading" : "",
        ].join(" ")}
      >
        {item.label}
        <span
          className={`absolute left-2 right-2 bottom-0 h-[2px] bg-[color:var(--brand-600)] transition-transform ${
            isRouteActive ? "scale-x-100" : "scale-x-0"
          }`}
        ></span>
      </Link>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-muted">
      <Container className="h-16 flex items-center justify-between gap-2 md:gap-4 overflow-hidden">
        <Logo />

        {/* Desktop Navigation - Show first 3 items */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-4 flex-shrink-0">
          {visibleNavItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>

        {/* Desktop Menu Button & Dropdown */}
        {menuNavItems.length > 0 && (
          <div className="hidden lg:block relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="medium text-xs md:text-sm xl:text-base hover:text-heading transition-colors relative whitespace-nowrap px-2 py-1 flex items-center gap-1"
            >
              More
              <svg
                className={`w-4 h-4 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {menuNavItems.map((item) => (
                    <div key={item.href} onClick={() => setIsMenuOpen(false)}>
                      <NavItem item={item} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden flex items-center justify-center p-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 flex-shrink-0"
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop Login/Sign Up */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-shrink-0">
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
              className="btn small rounded-btn text-xs md:text-sm px-3 lg:px-4 py-1.5 md:py-2 whitespace-nowrap"
            >
              Sign Up
            </button>
          ) : (
            <Link to="/signup" className="btn small rounded-btn text-xs md:text-sm px-3 lg:px-4 py-1.5 md:py-2 whitespace-nowrap">
              Sign Up
            </Link>
          )}
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMenuOpen(false)} aria-hidden="true" />
        )}

        {/* Mobile Menu Panel */}
        {isMenuOpen && (
          <div className="lg:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
            <div className="px-4 py-4 space-y-2">
              {NAV.map((item) => (
                <div key={item.href} onClick={() => setIsMenuOpen(false)}>
                  <NavItem item={item} />
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block medium text-sm font-semibold text-[color:var(--brand-600)] hover:opacity-90 px-2 py-2"
                >
                  Login
                </Link>
                {onSignUp ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onSignUp();
                    }}
                    className="btn w-full rounded-btn text-sm px-4 py-2 text-center"
                  >
                    Sign Up
                  </button>
                ) : (
                  <Link
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="btn w-full rounded-btn text-sm px-4 py-2 text-center block"
                  >
                    Sign Up
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}

