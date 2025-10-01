import { Fragment, useEffect, useMemo, useState } from "react";
import { Dialog, Transition, Combobox } from "@headlessui/react";
import { api } from "../../../../api/client.js";

const EMPTY_FORM = {
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  supervisor_id: "",
};

export default function AddSupervisorModal({ open, onClose, onSuccess, onToast }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [specializations, setSpecializations] = useState([]);
  const [availableOptions, setAvailableOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_FORM);
    setSpecializations([]);
    setError("");
    setSaving(false);
    setQuery("");
    setLoadingOptions(true);
    api("/supervisors/specializations")
      .then((res) => res.json())
      .then((data) => {
        if (!data || !Array.isArray(data.items)) throw new Error("Failed to load specializations");
        setAvailableOptions(data.items);
      })
      .catch((err) => {
        setAvailableOptions([]);
        onToast?.({ type: "error", message: err.message || "Failed to load specializations" });
      })
      .finally(() => setLoadingOptions(false));
  }, [open, onToast]);

  const filteredOptions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return availableOptions;
    return availableOptions.filter((option) => option.toLowerCase().includes(term));
  }, [query, availableOptions]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddCustomSpecialization() {
    const value = query.trim();
    if (!value) return;
    if (!specializations.includes(value)) {
      setSpecializations((prev) => [...prev, value]);
    }
    if (!availableOptions.includes(value)) {
      setAvailableOptions((prev) => [...prev, value]);
    }
    setQuery("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    setError("");
    if (!specializations.length) {
      setError("At least one specialization is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        firstName: form.first_name.trim(),
        middleName: form.middle_name.trim(),
        lastName: form.last_name.trim(),
        email: form.email.trim(),
        supervisorId: form.supervisor_id.trim(),
        specializations,
      };
      const res = await api("/supervisors/add", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to add supervisor");
      }
      onToast?.({ type: "success", message: "Supervisor added." });
      onSuccess?.(data.supervisor);
      onClose?.();
    } catch (err) {
      const message = err.message || "Failed to add supervisor";
      setError(message);
      onToast?.({ type: "error", message });
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving) return;
    onClose?.();
  }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-4 py-10">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
                <Dialog.Title className="text-xl font-semibold text-[color:var(--neutral-900)]">
                  Add Supervisor
                </Dialog.Title>
                <p className="mt-1 text-sm text-[color:var(--neutral-500)]">Create a supervisor profile for coordination and assignment.</p>

                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="sup-first-name">
                        First Name
                      </label>
                      <input
                        id="sup-first-name"
                        name="first_name"
                        required
                        value={form.first_name}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[color:var(--brand-600)] focus:ring-2 focus:ring-[color:var(--brand-200)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="sup-middle-name">
                        Middle Name
                      </label>
                      <input
                        id="sup-middle-name"
                        name="middle_name"
                        value={form.middle_name}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[color:var(--brand-600)] focus:ring-2 focus:ring-[color:var(--brand-200)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="sup-last-name">
                        Last Name
                      </label>
                      <input
                        id="sup-last-name"
                        name="last_name"
                        required
                        value={form.last_name}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[color:var(--brand-600)] focus:ring-2 focus:ring-[color:var(--brand-200)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="sup-email">
                        Email
                      </label>
                      <input
                        id="sup-email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[color:var(--brand-600)] focus:ring-2 focus:ring-[color:var(--brand-200)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[color:var(--neutral-800)]" htmlFor="sup-id">
                        Supervisor ID
                      </label>
                      <input
                        id="sup-id"
                        name="supervisor_id"
                        required
                        value={form.supervisor_id}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm shadow-sm outline-none focus:border-[color:var(--brand-600)] focus:ring-2 focus:ring-[color:var(--brand-200)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[color:var(--neutral-800)]">
                      Specializations
                    </label>
                    <Combobox value={specializations} onChange={setSpecializations} multiple>
                      <div className="relative mt-1">
                        <Combobox.Input
                          className="w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm text-[color:var(--neutral-700)] focus:border-[color:var(--brand-600)] focus:outline-none"
                          onChange={(event) => setQuery(event.target.value)}
                          displayValue={() => ""}
                          placeholder={loadingOptions ? "Loading…" : "Search or create"}
                        />
                        <Combobox.Options className="absolute z-10 mt-2 max-h-48 w-full overflow-auto rounded-xl border border-[color:var(--neutral-200)] bg-white py-2 text-sm shadow-lg">
                          {filteredOptions.length ? (
                            filteredOptions.map((option) => (
                              <Combobox.Option
                                key={option}
                                value={option}
                                className={({ active }) =>
                                  `flex items-center justify-between px-4 py-2 ${
                                    active
                                      ? "bg-[color:var(--brand-50)] text-[color:var(--brand-700)]"
                                      : "text-[color:var(--neutral-700)]"
                                  }`
                                }
                              >
                                {({ active, selected }) => (
                                  <>
                                    <span className={`font-medium ${selected ? 'text-[color:var(--brand-700)]' : ''}`}>
                                      {option}
                                    </span>
                                    {selected && <span className="text-xs text-[color:var(--brand-500)]">Selected</span>}
                                  </>
                                )}
                              </Combobox.Option>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-[color:var(--neutral-500)]">No matches found.</div>
                          )}
                        </Combobox.Options>
                        {query.trim() && (
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[color:var(--brand-600)] hover:underline"
                            onClick={handleAddCustomSpecialization}
                          >
                            Add "{query.trim()}"
                          </button>
                        )}
                      </div>
                    </Combobox>
                    {specializations.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {specializations.map((item) => (
                          <span key={item} className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-50)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-700)]">
                            {item}
                            <button type="button" onClick={() => setSpecializations((prev) => prev.filter((value) => value !== item))} className="text-[color:var(--brand-500)] hover:text-[color:var(--brand-700)]">
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>}

                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      className="rounded-xl border border-[color:var(--neutral-200)] px-4 py-2 text-sm font-semibold text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-100)]"
                      onClick={handleClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-[color:var(--brand-600)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--brand-500)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? "Saving…" : "Save"}
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
