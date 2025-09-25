import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { api } from "../api/client.js";

export default function SignUp({ defaults, onBack, onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();

  const resolvedDefaults = useMemo(() => ({ ...(defaults ?? {}), ...(location.state ?? {}) }), [defaults, location.state]);
  const verificationToken = resolvedDefaults.verificationToken;

  useEffect(() => {
    if (!verificationToken) {
      navigate("/verify", { replace: true });
    }
  }, [verificationToken, navigate]);

  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm({
      email: "",
      phone: resolvedDefaults.phone ?? "",
      password: "",
      confirmPassword: "",
    });
  }, [verificationToken, resolvedDefaults.phone]);

  const handleBack = useMemo(() => onBack ?? (() => navigate("/")), [navigate, onBack]);
  const handleLogin = useMemo(() => onLogin ?? (() => navigate("/login")), [navigate, onLogin]);

  function handleChange(event) {
    const { value } = event.target;
    const field = event.target.dataset.field || event.target.name;
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setInfo("");

    if (!verificationToken) {
      setError("Verification required before sign up.");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          verification_token: verificationToken,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Sign up failed");
      }

      localStorage.setItem("lastEmail", form.email.toLowerCase());
      setInfo("Account created successfully. Redirecting to login...");
      setTimeout(() => navigate("/login", { state: { message: 'Account created successfully. Please login.' } }), 1500);
    } catch (err) {
      setError(err.message || "Sign up error");
    } finally {
      setLoading(false);
    }
  }

  const readOnlyClasses = "h-12 rounded-[14px] border border-[color:var(--neutral-200)] bg-[color:var(--neutral-50)] px-4 text-[color:var(--neutral-500)]";
  const inputClasses = "h-12 rounded-[14px] border border-[color:var(--neutral-200)] px-4 text-[color:var(--neutral-800)] shadow-sm outline-none transition focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)]";

  return (
    <div className="verification-gradient min-h-screen px-4 py-16">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <p className="small uppercase tracking-[0.3em] text-[color:var(--brand-600)]/70">Create Account</p>
        <h1 className="mt-3 text-4xl font-semibold text-[color:var(--neutral-900)]">
          Finish setting up your <span className="text-[color:var(--brand-600)]">HiLCoE RMS</span> access
        </h1>
        <p className="mt-3 max-w-[35ch] text-[color:var(--neutral-600)]">
          Use your verified details and email address to activate your researcher workspace.
        </p>

        <form
          autoComplete="off"
          onSubmit={handleSubmit}
          className="mt-10 w-full rounded-[24px] bg-white px-10 py-12 text-left shadow-[0_24px_60px_rgba(8,26,66,0.12)]"
        >
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[color:var(--neutral-700)]">First Name</label>
              <input
                value={resolvedDefaults.firstName ?? ""}
                readOnly
                className={`${readOnlyClasses}`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[color:var(--neutral-700)]">Middle Name</label>
              <input
                value={resolvedDefaults.middleName ?? ""}
                readOnly
                className={`${readOnlyClasses}`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[color:var(--neutral-700)]">Last Name</label>
              <input
                value={resolvedDefaults.lastName ?? ""}
                readOnly
                className={`${readOnlyClasses}`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[color:var(--neutral-700)]">Researcher ID</label>
              <input
                value={resolvedDefaults.researcherId ?? ""}
                readOnly
                className={`${readOnlyClasses}`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-sm font-medium text-[color:var(--neutral-700)]">
                Phone (optional)
              </label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone"
                className={inputClasses}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-[color:var(--neutral-700)]">
                Email Address
              </label>
              <input
                id="email"
                name="signupEmail"
                data-field="email"
                type="email"
                autoComplete="off"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClasses}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-[color:var(--neutral-700)]">
                Password
              </label>
              <input
                id="password"
                name="signupPassword"
                data-field="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={inputClasses}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-[color:var(--neutral-700)]">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="signupPasswordConfirm"
                data-field="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={inputClasses}
              />
            </div>
          </div>

          {error && <p className="mt-4 text-sm font-medium text-red-500">{error}</p>}
          {info && <p className="mt-4 text-sm font-medium text-[color:var(--brand-600)]">{info}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="btn mt-8 h-12 w-full rounded-[14px] text-[17px] font-semibold tracking-wide disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>

          <p className="mt-8 text-center text-sm text-[color:var(--neutral-600)]">
            Already registered?{" "}
            <button
              type="button"
              onClick={handleLogin}
              className="font-semibold text-[color:var(--brand-600)] hover:underline"
            >
              Login
            </button>
          </p>
        </form>

        <button
          type="button"
          onClick={handleBack}
          className="mt-10 text-sm font-medium text-[color:var(--brand-600)] hover:underline"
        >
          Back to landing
        </button>
      </div>
    </div>
  );
}
