import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

export default function Verify({ onBack, onVerified }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", researcherId: "" });
  const [error, setError] = useState("");

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigate("/");
    }
  }, [navigate, onBack]);

  const handleVerified = useCallback(
    (data) => {
      if (onVerified) {
        onVerified(data);
      } else {
        navigate("/signup", { state: data });
      }
    },
    [navigate, onVerified]
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.firstName.trim() || !form.lastName.trim() || !form.researcherId.trim()) {
      setError("Fill out all fields to continue.");
      return;
    }

    // TODO: connect to verification API and handle success/failure states
    handleVerified(form);
  }

  return (
    <div className="verification-gradient min-h-screen px-4 py-16">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <p className="small uppercase tracking-[0.3em] text-[color:var(--brand-600)]/70">
          Researcher Verification
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-[color:var(--neutral-900)]">
          Welcome, To <span className="text-[color:var(--brand-600)]">HiLCoE RMS Verification</span>
        </h1>
        <p className="mt-3 max-w-[32ch] text-[color:var(--neutral-600)]">
          Simplifying Academic Research Management System
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
                ID
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
          </div>

          {error && (
            <p className="mt-4 text-sm font-medium text-red-500">{error}</p>
          )}

          <Button
            type="submit"
            className="btn mt-8 h-12 w-full rounded-[14px] text-[17px] font-semibold tracking-wide"
          >
            Verify
          </Button>

          <p className="mt-8 text-center text-sm text-[color:var(--neutral-600)]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-[color:var(--brand-600)] hover:underline"
            >
              Login
            </Link>
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
