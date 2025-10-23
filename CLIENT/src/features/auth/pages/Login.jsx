import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../shared/components/layout/Header.jsx";
import Footer from "../../../shared/components/layout/Footer.jsx";
import Container from "../../../shared/components/ui/Container.jsx";
import { api, setToken } from "../../../api/client.js";
import { validateEmail } from "../../../shared/utils/validation.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [info, setInfo] = useState(location.state?.message ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lastEmail");
    const rememberFlag = localStorage.getItem("rememberMe") === "true";
    if (saved) {
      setEmail(saved);
    }
    if (rememberFlag) {
      setRemember(true);
    }
  }, []);

  function handleEmailChange(event) {
    const value = event.target.value;
    setEmail(value);
    
    // Clear error when user starts typing
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  }

  function handlePasswordChange(event) {
    const value = event.target.value;
    setPassword(value);
    
    // Clear error when user starts typing
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  }

  function handleEmailBlur() {
    setTouched(prev => ({ ...prev, email: true }));
    validateEmailField();
  }

  function handlePasswordBlur() {
    setTouched(prev => ({ ...prev, password: true }));
    validatePasswordField();
  }

  function validateEmailField() {
    const result = validateEmail(email);
    setErrors(prev => ({ ...prev, email: result.message }));
    return result.isValid;
  }

  function validatePasswordField() {
    let error = '';
    if (!password.trim()) {
      error = 'Password is required';
    }
    setErrors(prev => ({ ...prev, password: error }));
    return !error;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setInfo("");
    
    // Mark all fields as touched
    setTouched({ email: true, password: true });
    
    // Validate all fields
    const isEmailValid = validateEmailField();
    const isPasswordValid = validatePasswordField();
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Login failed");
      }
      setToken(data.token);
      localStorage.setItem("lastEmail", email.toLowerCase());
      if (remember) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }

      let redirect = '/researcher'; 
      try {
        const profileRes = await api('/auth/me');
        const profileData = await profileRes.json().catch(() => null);
        if (profileRes.ok && profileData?.role) {
          localStorage.setItem('userRole', profileData.role);
          const role = String(profileData.role).toLowerCase();
          if (role.includes('coordinator')) {
            redirect = '/coordinator';
          } else if (role.includes('supervisor') || role.includes('advisor')) {
            redirect = '/supervisor';
          }
        }
      } catch (profileError) {
        console.warn('Profile lookup failed after login', profileError);
      }

      navigate(redirect, { replace: true });
    } catch (err) {
      setErrors({ general: err.message || "Login error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-login-gradient">
      <Header />
      <main className="py-8 md:py-16">
        <Container className="flex justify-center px-4">
          <div className="w-full max-w-md md:max-w-lg text-center">
            <h1 className="text-2xl md:text-3xl font-semibold text-[color:var(--neutral-900)]">
              Welcome, To <span className="text-[color:var(--brand-600)]">HiLCoE RMS Login</span>
            </h1>
            <p className="mt-2 text-lg md:text-xl font-medium text-[color:var(--brand-600)]">
              Simplifying Academic Research Management System
            </p>

            <div className="mt-8 md:mt-10 rounded-[24px] bg-white px-6 md:px-10 py-8 md:py-12 text-left shadow-[0_24px_60px_rgba(8,26,66,0.12)]">
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    placeholder="Enter Email"
                    className={`h-12 w-full rounded-[14px] border px-4 text-sm text-[color:var(--neutral-800)] outline-none transition focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)] ${
                      touched.email && errors.email 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-[color:var(--neutral-200)] focus:border-[color:var(--brand-600)]'
                    }`}
                    required
                  />
                  {touched.email && errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    placeholder="Enter password"
                    className={`h-12 w-full rounded-[14px] border px-4 text-sm text-[color:var(--neutral-800)] outline-none transition focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)] ${
                      touched.password && errors.password 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-[color:var(--neutral-200)] focus:border-[color:var(--brand-600)]'
                    }`}
                    required
                  />
                  {touched.password && errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-[color:var(--neutral-600)]">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      className="h-4 w-4 rounded border-[color:var(--neutral-300)] text-[color:var(--brand-600)] focus:ring-[color:var(--brand-600)]"
                    />
                    Remember me
                  </label>
                  
                  <a
                    href="/forgot-password"
                    className="text-sm font-semibold text-[color:var(--brand-600)] hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                
                {errors.general && <p className="text-sm font-medium text-red-500">{errors.general}</p>}
                {info && <p className="text-sm font-medium text-[color:var(--brand-600)]">{info}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn w-full rounded-[14px] py-3 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>


              <p className="mt-6 md:mt-8 text-center text-sm text-[color:var(--neutral-600)]">
                Don't have an account? <a href="/signup" className="font-semibold text-[color:var(--brand-600)] hover:underline">Sign up here</a>
              </p>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}



