import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../../api/client.js";
import UsersTable from "./users/UsersTable.jsx";
import UserAddModal from "./users/UserAddModal.jsx";
import UserEditModal from "./users/UserEditModal.jsx";
import ImportUsersModal from "./users/ImportUsersModal.jsx";
import AssignSupervisorModal from "./users/AssignSupervisorModal.jsx";
import DeleteStudentModal from "./users/DeleteStudentModal.jsx";
import SupervisorsTable from "./supervisors/SupervisorsTable.jsx";
import AddSupervisorModal from "./supervisors/AddSupervisorModal.jsx";
import EditSupervisorModal from "./supervisors/EditSupervisorModal.jsx";
import ImportSupervisorsModal from "./supervisors/ImportSupervisorsModal.jsx";
import ConfirmDeleteModal from "./supervisors/ConfirmDeleteModal.jsx";

function SupervisorsPlaceholder({ onGoToResearchers }) {
  return (
    <div className="rounded-3xl border border-dashed border-[color:var(--neutral-200)] bg-[color:var(--neutral-50)] p-10 text-center text-sm text-[color:var(--neutral-500)]">
      <p className="font-semibold text-[color:var(--neutral-700)]">Supervisor–User synchronization planning</p>
      <p className="mt-2 text-[color:var(--neutral-500)]">We’re finalizing Supervisor role + User linkage.</p>
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          className="rounded-xl bg-[color:var(--brand-600)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--brand-500)]"
          onClick={onGoToResearchers}
        >
          Go to Researchers to assign
        </button>
      </div>
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => onDismiss?.(), 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const palette =
    toast.type === "error"
      ? "bg-red-600 text-white"
      : toast.type === "success"
      ? "bg-[color:var(--brand-600)] text-white"
      : "bg-[color:var(--neutral-800)] text-white";

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <div
        className={`pointer-events-auto flex items-center gap-3 rounded-2xl px-5 py-3 text-sm shadow-lg transition ${palette}`}
      >
        <span>{toast.message}</span>
        <button type="button" className="ml-2 text-xs uppercase opacity-80 hover:opacity-100" onClick={onDismiss}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function UsersWorkspace() {
  const [Researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Researchers");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [editingStudent, setEditingStudent] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Supervisors state
  const [supervisors, setSupervisors] = useState([]);
  const [supLoading, setSupLoading] = useState(false);
  const [supError, setSupError] = useState("");
  const [isSupAddOpen, setIsSupAddOpen] = useState(false);
  const [isSupImportOpen, setIsSupImportOpen] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState(null);
  const [deleteSupervisorTarget, setDeleteSupervisorTarget] = useState(null);
  const [deletingSupervisor, setDeletingSupervisor] = useState(false);

  // Track available supervisors to validate existing assignments in Researchers tab
  const [availableSupervisorIds, setAvailableSupervisorIds] = useState([]);

  // Examiners
  const [examiners, setExaminers] = useState([]);
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState("");

  const fetchAvailableSupervisorIds = useCallback(async () => {
    try {
      // Use the same source as the assignment modal to avoid ID mismatches
      const res = await api(`/supervisors/available?_=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      const items = Array.isArray(data?.items) ? data.items : [];
      const ids = items
        .map((s) => s?.id ?? s?._id ?? s?.supervisor_id ?? s?.email)
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());
      setAvailableSupervisorIds(Array.from(new Set(ids)));
    } catch {
      // ignore; validation is best-effort
    }
  }, []);

  const fetchExaminers = useCallback(async () => {
    setExamLoading(true);
    setExamError("");
    try {
      const res = await api("/users");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.error || "Failed to load users");
      const list = (Array.isArray(data) ? data : []).filter((user) =>
        String(user.role || "").toLowerCase().includes("examiner")
      );
      setExaminers(list);
    } catch (err) {
      setExamError(err.message || "Failed to load examiners");
    } finally {
      setExamLoading(false);
    }
  }, []);

  const ResearchersWithValidAssignments = useMemo(() => {
    if (!availableSupervisorIds?.length) return Researchers;
    const valid = new Set(availableSupervisorIds.map((v) => String(v).toLowerCase()));
    return Researchers.map((stu) => {
      const asg = stu?.assigned_supervisor;
      if (!asg) return stu;
      const key = String(
        (asg.supervisor_id ?? asg._id ?? asg.id ?? asg.email ?? '')
      ).toLowerCase();
      if (!key || !valid.has(key)) {
        return { ...stu, assigned_supervisor: null };
      }
      return stu;
    });
  }, [Researchers, availableSupervisorIds]);

  const sortedResearchers = useMemo(
    () => ResearchersWithValidAssignments.slice().sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)),
    [ResearchersWithValidAssignments]
  );

  const departments = useMemo(() => {
    const values = new Set(
      sortedResearchers
        .map((student) => (student.program || "").trim())
        .filter(Boolean)
    );
    return ["all", ...Array.from(values).sort()];
  }, [sortedResearchers]);

  const filteredResearchers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const department = departmentFilter === "all" ? "" : departmentFilter;
    return sortedResearchers.filter((student) => {
      const matchesDepartment = !department || (student.program || "").toLowerCase() === department.toLowerCase();
      if (!matchesDepartment) return false;
      if (!term) return true;
      const haystack = [
        student.first_name,
        student.middle_name,
        student.last_name,
        student.student_id,
        student.program,
        student.assigned_supervisor?.supervisor_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [sortedResearchers, searchTerm, departmentFilter]);

  const fetchResearchers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api("/student-verifications?limit=200");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to load Researchers");
      }
      setResearchers(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      setError(err.message || "Failed to load Researchers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResearchers();
  }, [fetchResearchers]);

  // Keep available supervisors in sync while on Researchers tab
  useEffect(() => {
    if (activeTab === 'Researchers') {
      fetchAvailableSupervisorIds();
    }
  }, [activeTab, fetchAvailableSupervisorIds]);

  const fetchSupervisors = useCallback(async () => {
    setSupLoading(true);
    setSupError("");
    try {
      const res = await api("/supervisors?limit=200");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to load supervisors");
      }
      const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setSupervisors(items);
    } catch (err) {
      setSupError(err.message || "Failed to load supervisors");
    } finally {
      setSupLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "supervisors") {
      fetchSupervisors();
    }
  }, [activeTab, fetchSupervisors]);

  useEffect(() => {
    if (activeTab === "examiners") {
      fetchExaminers();
    }
  }, [activeTab, fetchExaminers]);

  const showToast = useCallback((toastValue) => {
    if (!toastValue) return;
    setToast({ id: Date.now(), ...toastValue });
  }, []);

  function handleAddSuccess(student) {
    setResearchers((prev) => [student, ...prev]);
    showToast({ type: "success", message: "Student queued for verification." });
    setIsAddOpen(false);
  }

  function handleImportSuccess(summary) {
    const inserted = summary?.inserted || 0;
    const duplicates = summary?.duplicates?.length || 0;
    const message = `Imported ${inserted} Researchers${duplicates ? `, ${duplicates} duplicate IDs skipped` : ""}.`;
    showToast({ type: "success", message });
    setIsImportOpen(false);
    fetchResearchers();
  }

  function handleEdit(student) {
    setEditingStudent(student);
  }

  function handleEditSuccess(updated) {
    setResearchers((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
    showToast({ type: "success", message: "Student details updated." });
    setEditingStudent(null);
  }

  function handleAssign(student) {
    setAssignTarget(student);
  }

  function handleAssignSuccess(updated) {
    setResearchers((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
    setAssignTarget(null);
    // refresh availability to reflect any capacity/visibility changes
    fetchAvailableSupervisorIds();
  }

  function handleDelete(student) {
    setDeleteTarget(student);
  }

  async function confirmDelete() {
    if (!deleteTarget?._id) {
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    try {
      const res = await api(`/students/${deleteTarget._id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete researcher");
      }
      setResearchers((prev) => prev.filter((item) => item._id !== deleteTarget._id));
      showToast({ type: "success", message: "Researcher removed from verification list." });
      try { localStorage.setItem('coordinatorDataUpdated', String(Date.now())); } catch {}
    } catch (err) {
      showToast({ type: "error", message: err.message || "Failed to delete researcher" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  function resetFilters() {
    setSearchTerm("");
    setDepartmentFilter("all");
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[color:var(--neutral-900)]">Users</h1>
          <p className="text-sm text-[color:var(--neutral-500)]">
            Queue eligible Researchers and manage verification readiness before accounts are created.
          </p>
        </div>
        {activeTab === "Researchers" && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl bg-[color:var(--brand-600)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--brand-500)]"
              onClick={() => setIsAddOpen(true)}
            >
              Add
            </button>
            <button
              type="button"
              className="rounded-xl border border-[color:var(--brand-600)] px-5 py-2 text-sm font-semibold text-[color:var(--brand-600)] transition hover:bg-[color:var(--brand-600)] hover:text-white"
              onClick={() => setIsImportOpen(true)}
            >
              Import
            </button>
          </div>
        )}
        {activeTab === "supervisors" && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl bg-[color:var(--brand-600)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--brand-500)]"
              onClick={() => setIsSupAddOpen(true)}
            >
              Add
            </button>
            <button
              type="button"
              className="rounded-xl border border-[color:var(--brand-600)] px-5 py-2 text-sm font-semibold text-[color:var(--brand-600)] transition hover:bg-[color:var(--brand-600)] hover:text-white"
              onClick={() => setIsSupImportOpen(true)}
            >
              Import
            </button>
          </div>
        )}
        {activeTab === "examiners" && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-xl border border-[color:var(--neutral-200)] px-5 py-2 text-sm font-semibold text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-100)]"
              onClick={fetchExaminers}
            >
              Refresh
            </button>
          </div>
        )}
      </header>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-6 border-b border-[color:var(--neutral-200)] pb-3 text-sm font-semibold">
            {[
              { key: "Researchers", label: "Researchers" },
              { key: "supervisors", label: "Supervisors" },
              { key: "examiners", label: "Examiners" },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  className={`pb-2 transition ${
                    isActive
                      ? "border-b-2 border-[color:var(--brand-600)] text-[color:var(--brand-700)]"
                      : "text-[color:var(--neutral-500)] hover:text-[color:var(--neutral-700)]"
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "Researchers" && (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                  <select
                    className="h-11 rounded-xl border border-[color:var(--neutral-200)] bg-white px-4 text-sm text-[color:var(--neutral-700)] focus:border-[color:var(--brand-500)] focus:outline-none"
                    value={departmentFilter}
                    onChange={(event) => setDepartmentFilter(event.target.value)}
                  >
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department === "all" ? "All departments" : department}
                      </option>
                    ))}
                  </select>
                  <div className="relative w-full sm:max-w-xs">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search by name or ID"
                      className="h-11 w-full rounded-xl border border-[color:var(--neutral-200)] px-4 text-sm text-[color:var(--neutral-700)] focus:border-[color:var(--brand-500)] focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="self-start text-xs font-semibold text-[color:var(--brand-600)] hover:underline"
                  onClick={resetFilters}
                >
                  Reset filters
                </button>
              </div>

              <UsersTable
                users={filteredResearchers}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAssign={handleAssign}
                onUnassign={async (student) => {
                  try {
                    const res = await api('/supervisors/unassign', {
                      method: 'POST',
                      body: JSON.stringify({ studentId: student._id }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) throw new Error(data?.error || 'Failed to unassign');
                    setResearchers((prev) => prev.map((s) => (s._id === student._id ? { ...s, assigned_supervisor: null } : s)));
                    showToast({ type: 'success', message: 'Supervisor removed from student.' });
                    fetchAvailableSupervisorIds();
                  } catch (err) {
                    showToast({ type: 'error', message: err.message || 'Failed to unassign' });
                  }
                }}
              />
            </>
          )}

          {activeTab === "supervisors" && (
            <>
              {supError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {supError}
                </div>
              )}
              <SupervisorsTable
                supervisors={supervisors}
                loading={supLoading}
                onEdit={setEditingSupervisor}
                onDelete={setDeleteSupervisorTarget}
                onInvite={async (sup) => {
                  try {
                    const res = await api('/auth/reset/request', {
                      method: 'POST',
                      body: JSON.stringify({ email: sup.email }),
                      headers: { 'Content-Type': 'application/json' },
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) throw new Error(data?.error || 'Failed to send invite');
                    if (data?.reset_token) {
                      try {
                        await navigator.clipboard.writeText(data.reset_token);
                        showToast({ type: 'success', message: 'Invite sent. Dev token copied to clipboard.' });
                      } catch {
                        showToast({ type: 'success', message: `Invite sent. Token: ${data.reset_token}` });
                      }
                    } else {
                      showToast({ type: 'success', message: 'Invite sent successfully.' });
                    }
                  } catch (err) {
                    showToast({ type: 'error', message: err.message || 'Failed to send invite' });
                  }
                }}
              />
            </>
          )}

          {activeTab === "examiners" && (
            <div>
              {examError && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {examError}
                </div>
              )}
              <div className="overflow-hidden rounded-2xl border border-[color:var(--neutral-200)]">
                <table className="min-w-full divide-y divide-[color:var(--neutral-200)] text-left text-sm">
                  <thead className="bg-[color:var(--neutral-50)] text-xs font-semibold uppercase tracking-wide text-[color:var(--neutral-500)]">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--neutral-100)] text-[color:var(--neutral-800)]">
                    {examLoading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-sm text-[color:var(--neutral-500)]">
                          Loading examiners...
                        </td>
                      </tr>
                    ) : examiners.length ? (
                      examiners.map((user) => (
                        <tr key={user._id || user.id || user.email}>
                          <td className="px-4 py-3 font-semibold">{user.name || [user.first_name, user.last_name].filter(Boolean).join(" ") || "-"}</td>
                          <td className="px-4 py-3 text-sm text-[color:var(--neutral-600)]">{user.email || "-"}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                String(user.status || "").toLowerCase() === "active"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {user.status || "pending"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[color:var(--neutral-600)]">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-sm text-[color:var(--neutral-500)]">
                          No examiners found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <UserAddModal open={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={handleAddSuccess} />
      <UserEditModal
        open={Boolean(editingStudent)}
        student={editingStudent}
        onClose={() => setEditingStudent(null)}
        onSuccess={handleEditSuccess}
      />
      <ImportUsersModal open={isImportOpen} onClose={() => setIsImportOpen(false)} onSuccess={handleImportSuccess} />
      <AssignSupervisorModal
        open={Boolean(assignTarget)}
        student={assignTarget}
        onClose={() => setAssignTarget(null)}
        onAssigned={handleAssignSuccess}
        onToast={showToast}
      />
      {/* Supervisors Modals */}
      <AddSupervisorModal
        open={isSupAddOpen}
        onClose={() => setIsSupAddOpen(false)}
        onToast={showToast}
        onSuccess={(created) => {
          setSupervisors((prev) => [created, ...prev]);
          setIsSupAddOpen(false);
        }}
      />
      <EditSupervisorModal
        open={Boolean(editingSupervisor)}
        supervisor={editingSupervisor}
        onClose={() => setEditingSupervisor(null)}
        onToast={showToast}
        onSuccess={(updated) => {
          setSupervisors((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
          setEditingSupervisor(null);
        }}
      />
      <ImportSupervisorsModal
        open={isSupImportOpen}
        onClose={() => setIsSupImportOpen(false)}
        onToast={showToast}
        onSuccess={() => {
          setIsSupImportOpen(false);
          fetchSupervisors();
        }}
      />
      <ConfirmDeleteModal
        open={Boolean(deleteSupervisorTarget)}
        supervisor={deleteSupervisorTarget}
        loading={deletingSupervisor}
        onCancel={() => {
          if (deletingSupervisor) return;
          setDeleteSupervisorTarget(null);
        }}
        onConfirm={async () => {
          if (!deleteSupervisorTarget?._id) return;
          setDeletingSupervisor(true);
          try {
            const res = await api(`/supervisors/${deleteSupervisorTarget._id}`, { method: 'DELETE' });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'Failed to delete supervisor');
            setSupervisors((prev) => prev.filter((s) => s._id !== deleteSupervisorTarget._id));
            // Also unassign this supervisor from any Researchers shown in the Researchers tab
            setResearchers((prev) => {
              const ids = new Set(
                [deleteSupervisorTarget._id, deleteSupervisorTarget.supervisor_id, deleteSupervisorTarget.id, deleteSupervisorTarget.email]
                  .filter(Boolean)
                  .map((v) => String(v).toLowerCase())
              );
              return prev.map((stu) => {
                const asg = stu?.assigned_supervisor;
                if (!asg) return stu;
                const asgId = String(
                  (asg.supervisor_id ?? asg._id ?? asg.id ?? asg.email ?? '')
                ).toLowerCase();
                if (asgId && ids.has(asgId)) {
                  return { ...stu, assigned_supervisor: null };
                }
                return stu;
              });
            });
            showToast({ type: 'success', message: 'Supervisor deleted.' });
            // Refresh Researchers from server to ensure consistency
            fetchResearchers();
            // Refresh availability set so badges are validated
            fetchAvailableSupervisorIds();
          } catch (err) {
            showToast({ type: 'error', message: err.message || 'Failed to delete supervisor' });
          } finally {
            setDeletingSupervisor(false);
            setDeleteSupervisorTarget(null);
          }
        }}
      />
      <DeleteStudentModal
        open={Boolean(deleteTarget)}
        student={deleteTarget}
        onCancel={() => {
          if (deleting) return;
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
        loading={deleting}
      />
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </section>
  );
}


