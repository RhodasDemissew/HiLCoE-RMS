import { useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Container from "../components/ui/Container";
import { api, setToken } from "../api/client.js";
import googleIcon from "../assets/icons/Googleicon.png";
import githubIcon from "../assets/icons/githubicon.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      const res = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, remember }),
      });
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      setToken(data.token);
      // TODO: route to dashboard once authenticated
    } catch (err) {
      setError(err.message || "Login error");
    }
  }

  return (
    <div className="min-h-screen bg-login-gradient">
      <Header />
      <main className="py-16">
        <Container className="flex justify-center">
          <div className="w-full max-w-lg text-center">
            <h1 className="text-3xl font-semibold text-[color:var(--neutral-900)]">
              Welcome, To <span className="text-[color:var(--brand-600)]">HiLCoE RMS Login</span>
            </h1>
            <p className="mt-2 text-l font-medium text-[color:var(--brand-600)] underline">
              Simplifying Academic Research Management System
            </p>

            <div className="mt-10 rounded-[24px] bg-white px-10 py-12 text-left shadow-[0_24px_60px_rgba(8,26,66,0.12)]">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter Email"
                    className="h-12 w-full rounded-[14px] border border-[color:var(--neutral-200)] px-4 text-sm text-[color:var(--neutral-800)] outline-none transition focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="password">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter password"
                      className="h-12 w-full rounded-[14px] border border-[color:var(--neutral-200)] px-4 pr-28 text-sm text-[color:var(--neutral-800)] outline-none transition focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)]"
                    />
                    <a
                      href="/forgot-password"
                      className="absolute right-4  translate-y-14 text-sm font-semibold text-[color:var(--brand-600)] hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-[color:var(--neutral-600)]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="h-4 w-4 rounded border-[color:var(--neutral-300)] text-[color:var(--brand-600)] focus:ring-[color:var(--brand-600)]"
                  />
                  Remember me
                </label>

                {error && (
                  <p className="text-sm monto font-medium text-red-500">{error}</p>
                )}

                <button
                  type="submit"
                  className="btn w-full rounded-[14px] py-3 text-base font-semibold"
                >
                  Login
                </button>
              </form>

              <div className="mt-8 flex items-center gap-4 text-sm text-[color:var(--neutral-500)]">
                <span className="h-px flex-1 bg-[color:var(--neutral-200)]" />
                Or continue with
                <span className="h-px flex-1 bg-[color:var(--neutral-200)]" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm font-semibold">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-[12px] border border-[color:var(--neutral-200)] py-3 text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-50)]"
                >
                  <img src={googleIcon} alt="Google" className="h-5 w-5" loading="lazy" decoding="async" /> Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-[12px] border border-[color:var(--neutral-200)] py-3 text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-50)]"
                >
                  <img src={githubIcon} alt="GitHub" className="h-5 w-5" loading="lazy" decoding="async" /> GitHub
                </button>
              </div>

              <p className="mt-8 text-center text-sm text-[color:var(--neutral-600)]">
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
