import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../../shared/components/layout/Header.jsx";
import Footer from "../../../shared/components/layout/Footer.jsx";
import Container from "../../../shared/components/ui/Container.jsx";
import { api } from "../../../api/client.js";
import { validateEmail } from "../../../shared/utils/validation.js";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  function handleEmailChange(event) {
    const value = event.target.value;
    setEmail(value);
    
    // Clear error when user starts typing
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  }

  function handleEmailBlur() {
    setTouched(prev => ({ ...prev, email: true }));
    validateEmailField();
  }

  function validateEmailField() {
    const result = validateEmail(email);
    setErrors(prev => ({ ...prev, email: result.message }));
    return result.isValid;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    
    // Mark field as touched
    setTouched({ email: true });
    
    // Validate field
    const isEmailValid = validateEmailField();
    
    if (!isEmailValid) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await api("/auth/reset/request", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to send reset email");
      }
      
      // Success - show message
      setSuccess(true);
      const isDev = import.meta.env?.MODE === 'development' || window.location.hostname === 'localhost';
      if (isDev && data.reset_token) {
        setMessage(`Reset token (dev only): ${data.reset_token}\nReset link: ${data.link || '/reset?token=' + data.reset_token}`);
      } else {
        setMessage("If an account with that email exists, a password reset link has been sent. Please check your email.");
      }
    } catch (err) {
      setSuccess(false);
      setErrors({ general: err.message || "Failed to send reset email" });
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
              <span className="text-[color:var(--brand-600)]">Forgot Password</span>
            </h1>
            <p className="mt-2 text-lg md:text-xl font-medium text-[color:var(--brand-600)]">
              Enter your email to receive a password reset link
            </p>

            <div className="mt-8 md:mt-10 rounded-[24px] bg-white px-6 md:px-10 py-8 md:py-12 text-left shadow-[0_24px_60px_rgba(8,26,66,0.12)]">
              {success ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 whitespace-pre-wrap">
                    {message}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSuccess(false);
                        setEmail("");
                        setMessage("");
                        setErrors({});
                        setTouched({});
                      }}
                      className="btn-secondary w-full rounded-[14px] py-3 text-base font-semibold"
                    >
                      Send Another Email
                    </button>
                    <Link
                      to="/login"
                      className="btn w-full rounded-[14px] py-3 text-base font-semibold text-center"
                    >
                      Back to Login
                    </Link>
                  </div>
                </div>
              ) : (
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
                      placeholder="Enter your email"
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
                  
                  {errors.general && <p className="text-sm font-medium text-red-500">{errors.general}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn w-full rounded-[14px] py-3 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              )}

              <p className="mt-6 md:mt-8 text-center text-sm text-[color:var(--neutral-600)]">
                Remember your password? <Link to="/login" className="font-semibold text-[color:var(--brand-600)] hover:underline">Login here</Link>
              </p>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

