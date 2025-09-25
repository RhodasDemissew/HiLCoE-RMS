import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

export default function SignUp({ defaults, onBack, onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const resolvedDefaults = useMemo(
    () => ({ ...(defaults ?? {}), ...(location.state ?? {}) }),
    [defaults, location.state]
  );

  const [form, setForm] = useState({
    firstName: resolvedDefaults.firstName ?? "",
    lastName: resolvedDefaults.lastName ?? "",
    researcherId: resolvedDefaults.researcherId ?? "",
    email: resolvedDefaults.email ?? "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      firstName: resolvedDefaults.firstName ?? "",
      lastName: resolvedDefaults.lastName ?? "",
      researcherId: resolvedDefaults.researcherId ?? "",
      email: resolvedDefaults.email ?? "",
    }));
  }, [resolvedDefaults]);

  const handleBack = useMemo(() => onBack ?? (() => navigate("/")), [navigate, onBack]);
  const handleLogin = useMemo(
    () => onLogin ?? (() => navigate("/login")),
    [navigate, onLogin]
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.email.endsWith("@gmail.com")) {
      setError("Use a valid Gmail address to sign up.");
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

    // TODO: call signup API with form data
  }

  return (
    <div className="verification-gradient min-h-screen px-4 py-16">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <p className="small uppercase tracking-[0.3em] text-[color:var(--brand-600)]/70">
          Create Account
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-[color:var(--neutral-900)]">
          Finish setting up your <span className="text-[color:var(--brand-600)]">HiLCoE RMS</span> access
        </h1>
        <p className="mt-3 max-w-[35ch] text-[color:var(--neutral-600)]">
          Use your verified details and Gmail address to activate your researcher workspace.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 w-full rounded-[24px] bg-white px-10 py-12 text-left shadow-[0_24px_60px_rgba(8,26,66,0.12)]"
        >
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="firstName" className="text-sm font-medium text-[color:var(--neutral-700)]">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Enter First Name"
                className="h-12 rounded-[14px] border border-[color:var(--neutral-200)] px-4 text-[color:var(--neutral-800)] shadow-sm outline-none transition focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="lastName" className="text-sm font-medium text-[color:var(--neutral-700)]">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Enter Last Name"
                className="h-12 rounded-[14px] border border-[color:var(--neutral-200)] px-4 text-[color:var(--neutral-800)] shadow-sm outline-none transition focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="researcherId" className="text-sm font-medium text-[color:var(--neutral-700)]">
                Researcher ID
              </label>
              <input
                id="researcherId"
                name="researcherId"
                value={form.researcherId}
                onChange={handleChange}
                placeholder="Student ID"
                className="h-12 rounded-[14px] border border-[color:var(--neutral-200)] px-4 text-[color:var(--neutral-800)] shadow-sm outline-none transition focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-[color:var(--neutral-700)]">
                Gmail Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="youremail@gmail.com"
                className="h-12 rounded-[14px] border border-[color:var(--neutral-200)] px-4 text-[color:var(--neutral-800)] shadow-sm outline-none transition focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-[color:var(--neutral-700)]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="h-12 rounded-[14px] border border-[color:var(--neutral-200)] px-4 text-[color:var(--neutral-800)] shadow-sm outline-none transition focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-[color:var(--neutral-700)]">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="h-12 rounded-[14px] border border-[color:var(--neutral-200)] px-4 text-[color:var(--neutral-800)] shadow-sm outline-none transition focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)]"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm font-medium text-red-500">{error}</p>
          )}

          <Button
            type="submit"
            className="btn mt-8 h-12 w-full rounded-[14px] text-[17px] font-semibold tracking-wide"
          >
            Create Account
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
