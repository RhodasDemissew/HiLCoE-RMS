import { useEffect, useState } from "react";
import { api } from "../../../../api/client.js";

function createEmptyForm() {
  return { first_name: "", middle_name: "", last_name: "", student_id: "", program: "" };
}

export default function UserAddModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(() => createEmptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(createEmptyForm());
      setError("");
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleClose() {
    setForm(createEmptyForm());
    setError("");
    setSubmitting(false);
    onClose?.();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        first_name: form.first_name.trim(),
        middle_name: form.middle_name.trim(),
        last_name: form.last_name.trim(),
        student_id: form.student_id.trim(),
        program: form.program.trim(),
      };
      const res = await api("/student-verifications", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to add student");
      }
      setForm(createEmptyForm());
      onSuccess?.(data);
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[color:var(--neutral-900)]">Add Researcher</h2>
            <p className="text-sm text-[color:var(--neutral-500)]">Queue a student for later verification.</p>
          </div>
          <button
            type="button"
            className="text-[color:var(--neutral-400)] hover:text-[color:var(--neutral-600)]"
            onClick={handleClose}
            aria-label="Close add researcher modal"
          >
            X
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="first_name">
              First Name
            </label>
            <input
              id="first_name"
              name="first_name"
              required
              value={form.first_name}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[color:var(--brand-600)] focus:ring-2 focus:ring-[color:var(--brand-200)]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="middle_name">
              Middle Name
            </label>
            <input
              id="middle_name"
              name="middle_name"
              value={form.middle_name}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[color:var(--brand-600)] focus:ring-2 focus:ring-[color:var(--brand-200)]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="last_name">
              Last Name
            </label>
            <input
              id="last_name"
              name="last_name"
              required
              value={form.last_name}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[color:var(--brand-600)] focus:ring-2 focus:ring-[color:var(--brand-200)]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="student_id">
              Student ID
            </label>
            <input
              id="student_id"
              name="student_id"
              required
              value={form.student_id}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[color:var(--brand-600)] focus:ring-2 focus:ring-[color:var(--brand-200)]"
            />
            <p className="mt-1 text-xs text-[color:var(--neutral-500)]">Must be unique for each researcher.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="program">
              Program / Department (optional)
            </label>
            <input
              id="program"
              name="program"
              value={form.program}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[color:var(--brand-600)] focus:ring-2 focus:ring-[color:var(--brand-200)]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="rounded-xl border border-[color:var(--neutral-200)] px-4 py-2 text-sm font-semibold text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-100)]"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[color:var(--brand-600)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--brand-500)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
