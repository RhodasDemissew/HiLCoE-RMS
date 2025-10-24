import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { api } from "../../../../api/client.js";

const EMPTY_FORM = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  examiner_id: "",
  specializations: "",
};

export default function AddExaminerModal({ open, onClose, onSuccess, onToast }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_FORM);
    setError("");
    setSaving(false);
  }, [open]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    const { first_name, middle_name, last_name, email, examiner_id, specializations } = form;
    if (!first_name?.trim() || !last_name?.trim() || !email?.trim()) {
      setError("First name, last name, and email are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        first_name: first_name.trim(),
        middle_name: middle_name.trim(),
        last_name: last_name.trim(),
        name: [first_name.trim(), middle_name.trim(), last_name.trim()].filter(Boolean).join(" "),
        email: email.trim().toLowerCase(),
        examiner_id: examiner_id.trim() || null,
        specializations: specializations.trim() || null,
        role: "Examiner",
        status: "active",
      };

      const res = await api("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to create examiner");
      }

      onSuccess?.(data);
      onToast?.({ type: "success", message: "Examiner created successfully" });
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to create examiner");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold text-[color:var(--neutral-900)]">
                  Add Examiner
                </Dialog.Title>
                <p className="mt-1 text-sm text-[color:var(--neutral-500)]">
                  Create an examiner profile for thesis evaluation and assessment.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-semibold text-[color:var(--neutral-800)]">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={form.first_name}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm focus:border-[color:var(--brand-500)] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[color:var(--neutral-800)]">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        name="middle_name"
                        value={form.middle_name}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm focus:border-[color:var(--brand-500)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[color:var(--neutral-800)]">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={form.last_name}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm focus:border-[color:var(--brand-500)] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-[color:var(--neutral-800)]">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm focus:border-[color:var(--brand-500)] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[color:var(--neutral-800)]">
                        Examiner ID
                      </label>
                      <input
                        type="text"
                        name="examiner_id"
                        value={form.examiner_id}
                        onChange={handleChange}
                        placeholder="Optional"
                        className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm focus:border-[color:var(--brand-500)] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[color:var(--neutral-800)]">
                      Specializations
                    </label>
                    <input
                      type="text"
                      name="specializations"
                      value={form.specializations}
                      onChange={handleChange}
                      placeholder="e.g., Computer Science, Data Science, AI/ML"
                      className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm focus:border-[color:var(--brand-500)] focus:outline-none"
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                      type="button"
                      className="rounded-xl border border-[color:var(--neutral-200)] px-4 py-2 text-sm font-semibold text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-100)]"
                      onClick={onClose}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-[color:var(--brand-600)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--brand-500)] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={saving}
                    >
                      {saving ? "Creating..." : "Create Examiner"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
