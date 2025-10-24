const columns = [
  {
    key: "full_name",
    label: "Full Name",
    format: (user) => [user.first_name, user.middle_name].filter(Boolean).join(" ") || user.last_name || "�",
  },
  { key: "student_id", label: "Researcher ID", format: (user) => user.student_id },
  { key: "program", label: "Program", format: (user) => user.program || "�" },
  {
    key: "created_at",
    label: "Queued On",
    format: (user) => (user.created_at ? new Date(user.created_at).toLocaleDateString() : "�"),
  },
];

function renderStatus(user) {
  const verified = Boolean(user.verified_at);
  const label = verified ? "Verified" : "Pending";
  const style = verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700";
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
}

function SupervisorBadge({ user }) {
  const supervisor = user?.assigned_supervisor;
  if (!supervisor?.supervisor_name) return null;
  return (
    <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-50)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-700)]">
      {supervisor.supervisor_name}
    </span>
  );
}

export default function UsersTable({ users = [], loading = false, onEdit, onDelete, onAssign, onUnassign }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-[color:var(--neutral-200)] bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[color:var(--neutral-200)] text-left">
          <thead className="bg-[color:var(--neutral-50)] text-xs font-semibold uppercase tracking-wide text-[color:var(--neutral-500)]">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-6 py-3">
                  {column.label}
                </th>
              ))}
              <th className="px-6 py-3">Assign</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-2 py-3" aria-label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--neutral-100)] text-sm text-[color:var(--neutral-800)]">
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-center" colSpan={columns.length + 3}>
                  Loading researchers�
                </td>
              </tr>
            ) : users.length ? (
              users.map((user) => {
                const rowKey = user._id || user.student_id;
                return (
                  <tr key={rowKey} className="group relative">
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4">
                        <div className="transition-transform duration-500 ease-out group-hover:-translate-x-6">
                          {column.format(user)}
                        </div>
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-2 transition-transform duration-500 ease-out group-hover:-translate-x-6">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-full bg-[color:var(--brand-600)] px-3 py-1 text-xs font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:bg-[color:var(--brand-500)]"
                            onClick={() => onAssign?.(user)}
                          >
                            {user?.assigned_supervisor ? 'Reassign' : 'Assign'}
                          </button>
                          {user?.assigned_supervisor && (
                            <button
                              type="button"
                              className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600 transition-all duration-200 ease-in-out hover:bg-red-200"
                              onClick={() => onUnassign?.(user)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <SupervisorBadge user={user} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="transition-transform duration-500 ease-out group-hover:-translate-x-6">
                        {renderStatus(user)}
                      </div>
                    </td>
                    <td className="px-2 py-4 w-0">
                      <div className="flex items-center gap-2 translate-x-12 opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100">
                        <button
                          type="button"
                          className="rounded-full bg-[color:var(--neutral-100)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-600)] transition-all duration-200 ease-in-out hover:bg-[color:var(--brand-50)]"
                          onClick={() => onEdit?.(user)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600 transition-all duration-200 ease-in-out hover:bg-red-200"
                          onClick={() => onDelete?.(user)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="px-6 py-6 text-center text-[color:var(--neutral-500)]" colSpan={columns.length + 3}>
                  No researchers have been queued for verification yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}



