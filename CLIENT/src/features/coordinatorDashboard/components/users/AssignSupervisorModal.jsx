import { Fragment, useEffect, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { api } from "../../../../api/client.js";

export default function AssignSupervisorModal({ open, student, onClose, onAssigned, onToast }) {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fullName = useMemo(() => {
    if (!student) return "";
    return [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(" ");
  }, [student]);

  useEffect(() => {
    if (!open) return;
    setSelectedId(student?.assigned_supervisor?.supervisor_id || "");
    setSearch("");
    setError("");
    setLoading(true);
    api(`/supervisors/available?_=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (!data || !Array.isArray(data.items)) throw new Error("Failed to load supervisors");
        // Deduplicate primarily by email to avoid duplicates coming from both users and supervisors collections
        const unique = [];
        const seenEmails = new Set();
        const seenIds = new Set();
        for (const s of data.items) {
          const emailKey = String(s?.email || s?.supervisor_email || '').toLowerCase();
          if (emailKey) {
            if (seenEmails.has(emailKey)) continue;
            seenEmails.add(emailKey);
            unique.push(s);
            continue;
          }
          const idRaw = s?.id ?? s?._id ?? s?.supervisor_id ?? s?.email;
          if (!idRaw) continue;
          const idKey = String(idRaw).toLowerCase();
          if (seenIds.has(idKey)) continue;
          seenIds.add(idKey);
          unique.push(s);
        }
        setSupervisors(unique);
      })
      .catch((err) => {
        setError(err.message || "Unable to load supervisors");
        onToast?.({ type: "error", message: err.message || "Unable to load supervisors" });
      })
      .finally(() => setLoading(false));
  }, [open, student, onToast]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return supervisors;
    return supervisors.filter((supervisor) =>
      [supervisor.name, supervisor.email].filter(Boolean).join(" ").toLowerCase().includes(term)
    );
  }, [supervisors, search]);

  async function handleConfirm() {
    if (!selectedId) {
      setError("Please select a supervisor");
      return;
    }
    if (!student?._id) {
      setError("Missing student identifier");
      return;
    }
    setAssigning(true);
    setError("");
    try {
      const res = await api("/supervisors/assign", {
        method: "POST",
        body: JSON.stringify({ studentId: student._id, supervisorId: selectedId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to assign supervisor");
      }
      onAssigned?.(data);
      onToast?.({ type: "success", message: "Supervisor assigned." });
      onClose?.();
    } catch (err) {
      const message = err.message || "Failed to assign supervisor";
      setError(message);
      onToast?.({ type: "error", message });
    } finally {
      setAssigning(false);
    }
  }

  function handleClose() {
    if (assigning) return;
    onClose?.();
  }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
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
              <Dialog.Panel className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
                <Dialog.Title className="text-xl font-semibold text-[color:var(--neutral-900)]">
                  Assign Supervisor
                </Dialog.Title>
                <p className="mt-1 text-sm text-[color:var(--neutral-500)]">
                  Select a supervisor for <span className="font-semibold text-[color:var(--neutral-800)]">{fullName}</span>.
                </p>

                <div className="mt-5 space-y-4">
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name or email"
                    className="w-full rounded-xl border border-[color:var(--neutral-200)] px-4 py-2.5 text-sm text-[color:var(--neutral-700)] focus:border-[color:var(--brand-500)] focus:outline-none"
                  />

                  <div className="max-h-60 overflow-y-auto rounded-2xl border border-[color:var(--neutral-200)]">
                    {loading ? (
                      <div className="px-4 py-10 text-center text-sm text-[color:var(--neutral-500)]">Loading supervisors…</div>
                    ) : filtered.length ? (
                      <ul className="divide-y divide-[color:var(--neutral-100)]">
                        {filtered.map((supervisor) => {
                          const supKey = supervisor.id ?? supervisor._id ?? supervisor.supervisor_id ?? supervisor.email;
                          const supKeyStr = String(supKey);
                          const isSelected = selectedId === supKeyStr;
                          return (
                            <li key={supKeyStr}>
                              <button
                                type="button"
                                className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                                  isSelected
                                    ? "bg-[color:var(--brand-50)] text-[color:var(--brand-700)]"
                                    : "hover:bg-[color:var(--neutral-50)]"
                                }`}
                                onClick={() => setSelectedId(supKeyStr)}
                              >
                                <span>
                                  <span className="block font-semibold">{supervisor.name}</span>
                                  <span className="block text-xs text-[color:var(--neutral-500)]">{supervisor.email}</span>
                                </span>
                                <span
                                  className={`h-5 w-5 rounded-full border ${
                                    isSelected
                                      ? "border-[color:var(--brand-600)] bg-[color:var(--brand-600)]"
                                      : "border-[color:var(--neutral-300)]"
                                  }`}
                                />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="px-4 py-10 text-center text-sm text-[color:var(--neutral-500)]">
                        No supervisors found.
                      </div>
                    )}
                  </div>

                  {error && (
                    <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="rounded-xl border border-[color:var(--neutral-200)] px-4 py-2 text-sm font-semibold text-[color:var(--neutral-600)] hover:bg-[color:var(--neutral-100)]"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={assigning}
                    className="rounded-xl bg-[color:var(--brand-600)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--brand-500)] disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={handleConfirm}
                  >
                    {assigning ? "Assigning…" : "Confirm"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}



