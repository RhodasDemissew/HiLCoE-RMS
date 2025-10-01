import { formatFullName } from "../../utils/supervisorUtils.js";

function formatSpecializations(list = []) {
  if (!Array.isArray(list) || !list.length) return '—';
  return list.join(', ');
}

export default function SupervisorsTable({ supervisors = [], loading = false, onEdit, onDelete, onInvite }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-[color:var(--neutral-200)] bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[color:var(--neutral-200)] text-left">
          <thead className="bg-[color:var(--neutral-50)] text-xs font-semibold uppercase tracking-wide text-[color:var(--neutral-500)]">
            <tr>
              <th className="px-6 py-3">Full Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Supervisor ID</th>
              <th className="px-6 py-3">Specialization</th>
              <th className="px-2 py-3" aria-label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--neutral-100)] text-sm text-[color:var(--neutral-800)]">
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-center" colSpan={5}>
                  Loading supervisors…
                </td>
              </tr>
            ) : supervisors.length ? (
              supervisors.map((supervisor) => {
                const key = supervisor._id || supervisor.supervisor_id;
                return (
                  <tr key={key} className="group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[color:var(--neutral-900)]">{formatFullName(supervisor)}</div>
                      {supervisor.middle_name && (
                        <div className="text-xs text-[color:var(--neutral-500)]">{supervisor.middle_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[color:var(--brand-600)]">{supervisor.email}</td>
                    <td className="px-6 py-4 font-semibold">{supervisor.supervisor_id}</td>
                    <td className="px-6 py-4 text-[color:var(--neutral-600)]">
                      {formatSpecializations(supervisor.specializations)}
                    </td>
                    <td className="px-2 py-4 w-0">
                      <div className="flex items-center gap-2 translate-x-12 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                        <button
                          type="button"
                          className="rounded-full bg-[color:var(--brand-600)] px-3 py-1 text-xs font-semibold text-white hover:bg-[color:var(--brand-500)]"
                          onClick={() => onInvite?.(supervisor)}
                        >
                          Invite
                        </button>
                        <button
                          type="button"
                          className="rounded-full bg-[color:var(--neutral-100)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-600)] hover:bg-[color:var(--brand-50)]"
                          onClick={() => onEdit?.(supervisor)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-200"
                          onClick={() => onDelete?.(supervisor)}
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
                <td className="px-6 py-6 text-center text-[color:var(--neutral-500)]" colSpan={5}>
                  No supervisors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
