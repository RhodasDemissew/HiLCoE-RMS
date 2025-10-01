import { useEffect, useState } from "react";
import { api } from "../../../../api/client.js";

const EMPTY_FORM = { first_name: "", middle_name: "", last_name: "", student_id: "", program: "" };

export default function UserEditModal({ open, student, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && student) {
      setForm({
        first_name: student.first_name || "",
        middle_name: student.middle_name || "",
        last_name: student.last_name || "",
        student_id: student.student_id || "",
        program: student.program || "",
      });
      setError("");
      setSubmitting(false);
    }
  }, [open, student]);

  if (!open || !student) return null;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!student?._id) {
      setError('Record is missing an identifier');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        first_name: form.first_name.trim(),
        middle_name: form.middle_name.trim(),
        last_name: form.last_name.trim(),
        student_id: form.student_id.trim(),
        program: form.program.trim(),
      };
      const res = await api(`/student-verifications/${student._id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update student");
      }
      onSuccess?.(data);
      onClose?.();
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
            <h2 className="text-xl font-semibold text-[color:var(--neutral-900)]">Edit Researcher</h2>
            <p className="text-sm text-[color:var(--neutral-500)]">Adjust details before verification.</p>
          </div>
          <button
            type="button"
            className="text-[color:var(--neutral-400)] hover:text-[color:var(--neutral-600)]"
            onClick={onClose}
            aria-label="Close edit researcher modal"
          >
            X
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="first_name_edit">
              First Name
            </label>
            <input
              id="first_name_edit"
              name="first_name"
              required
              value={form.first_name}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[color:var(--brand-600)] focus:ring-2 focus:ring-[color:var(--brand-200)]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="middle_name_edit">
              Middle Name
            </label>
            <input
              id="middle_name_edit"
              name="middle_name"
              value={form.middle_name}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[color:var(--brand-600)] focus:ring-2 focus:ring-[color:var(--brand-200)]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="last_name_edit">
              Last Name
            </label>
            <input
              id="last_name_edit"
              name="last_name"
              required
              value={form.last_name}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[color:var(--brand-600)] focus:ring-2 focus:ring-[color:var(--brand-200)]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="student_id_edit">
              Student ID
            </label>
            <input
              id="student_id_edit"
              name="student_id"
              required
              value={form.student_id}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[color:var(--brand-600)] focus:ring-2 focus:ring-[color:var(--brand-200)]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="program_edit">
              Program / Department (optional)
            </label>
            <input
              id="program_edit"
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
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[color:var(--brand-600)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--brand-500)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

