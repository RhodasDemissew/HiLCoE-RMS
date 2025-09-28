import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { api } from "../api/client.js";

export default function Verify({ onBack, onVerified }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", middleName: "", lastName: "", studentId: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      navigate("/");
    }
  }

  function forwardToSignUp(payload) {
    if (onVerified) {
      onVerified(payload);
    } else {
      navigate("/signup", { state: payload });
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.firstName.trim() || !form.lastName.trim() || !form.studentId.trim()) {
      setError("Fill out all required fields to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await api("/auth/verify", {
        method: "POST",
        body: JSON.stringify({
          first_name: form.firstName,
          middle_name: form.middleName,
          last_name: form.lastName,
          student_id: form.studentId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Verification failed");
      }

      if (data.already_registered) {
        if (data.login_hint) {
          localStorage.setItem("lastEmail", data.login_hint);
        }
        navigate("/login", { state: { message: 'Account already activated. Please login.' } });
        return;
      }

      const student = data.student ?? {};
      forwardToSignUp({
        verificationToken: data.verification_token,
        expiresAt: data.expires_at,
        firstName: student.first_name,
        middleName: student.middle_name,
        lastName: student.last_name,
        researcherId: student.student_id,
        program: student.program,
      });
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
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
              <label htmlFor="middleName" className="text-sm font-medium text-[color:var(--neutral-700)]">
                Middle Name (optional)
              </label>
              <input
                id="middleName"
                name="middleName"
                value={form.middleName}
                onChange={handleChange}
                placeholder="Enter Middle Name"
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
              <label htmlFor="studentId" className="text-sm font-medium text-[color:var(--neutral-700)]">
                ID
              </label>
              <input
                id="studentId"
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                placeholder="Student ID"
                className="h-12 rounded-[14px] border border-[color:var(--neutral-200)] px-4 text-[color:var(--neutral-800)] shadow-sm outline-none transition focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)]"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-sm font-medium text-red-500">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="btn mt-8 h-12 w-full rounded-[14px] text-[17px] font-semibold tracking-wide disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify"}
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
