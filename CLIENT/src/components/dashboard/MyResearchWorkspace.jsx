import { useMemo, useState } from "react";
import wordIcon from "../../assets/icons/word.png";

const RESEARCH_RECORDS = [
  {
    name: "Synopsis.doc",
    type: "Synopsis submission",
    stage: "Waiting for review",
    status: "In Progress",
    date: "Aug 8, 2025",
    size: "234 KB",
  },
  {
    name: "Synopsis.doc",
    type: "Synopsis submission",
    stage: "Waiting for review",
    status: "In Progress",
    date: "Aug 8, 2025",
    size: "234 KB",
  },
  {
    name: "Synopsis.doc",
    type: "Synopsis submission",
    stage: "Waiting for review",
    status: "In Progress",
    date: "Aug 8, 2025",
    size: "234 KB",
  },
  {
    name: "Synopsis.doc",
    type: "Synopsis submission",
    stage: "Waiting for review",
    status: "In Progress",
    date: "Aug 8, 2025",
    size: "234 KB",
  },
];

const STATUS_STYLES = {
  "In Progress": "bg-[color:var(--brand-600)]/15 text-[color:var(--brand-600)]",
  Waiting: "bg-[color:var(--neutral-200)] text-[color:var(--neutral-700)]",
  Completed: "bg-[color:var(--accent-emerald)]/15 text-[color:var(--accent-emerald)]",
};

export default function MyResearchWorkspace() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredRecords = useMemo(() => {
    if (!normalizedQuery) {
      return RESEARCH_RECORDS;
    }

    return RESEARCH_RECORDS.filter((record) => {
      const values = [record.name, record.type, record.stage, record.status];
      return values.some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [normalizedQuery]);

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12">
        <header className="card rounded-card border border-transparent bg-white px-8 py-6 shadow-soft">
          <h1 className="h2 text-[color:var(--neutral-900)]">My Research</h1>
        </header>
      </div>

      <div className="col-span-12">
        <section className="card rounded-card border border-muted bg-white px-0 py-0 shadow-soft">
          <div className="flex flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:max-w-sm">
              <label htmlFor="research-search" className="sr-only">
                Search files
              </label>
              <input
                id="research-search"
                type="search"
                placeholder="Search files"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full rounded-[12px] border border-[color:var(--neutral-200)] bg-white px-4 py-2 text-sm text-[color:var(--neutral-800)] outline-none focus:border-[color:var(--brand-600)] focus:shadow-[0_0_0_3px_rgba(5,136,240,0.18)]"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-b-[24px] border-t border-[color:var(--neutral-200)]">
            <table className="min-w-full table-auto text-left text-sm text-[color:var(--neutral-700)]">
              <thead className="bg-[color:var(--neutral-100)] text-xs uppercase tracking-wide text-[color:var(--neutral-600)]">
                <tr>
                  <th className="px-6 py-3 font-semibold">File Name</th>
                  <th className="px-6 py-3 font-semibold">Type</th>
                  <th className="px-6 py-3 font-semibold">Stage</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">File Size</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr key={`${record.name}-${index}`} className="border-t border-[color:var(--neutral-200)] hover:bg-[color:var(--neutral-100)]/60">
                    <td className="px-6 py-3 font-medium text-[color:var(--neutral-900)]">
                      <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--brand-600)]/10">
                        <img src={wordIcon} alt="" className="h-4 w-4" loading="lazy" decoding="async" aria-hidden />
                      </span>
                      {record.name}
                    </td>
                    <td className="px-6 py-3 capitalize">{record.type}</td>
                    <td className="px-6 py-3 capitalize">{record.stage}</td>
                    <td className="px-6 py-3">
                      <span className={`${STATUS_STYLES[record.status]} rounded-full px-3 py-1 text-xs font-semibold`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">{record.date}</td>
                    <td className="px-6 py-3">{record.size}</td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-center text-sm text-[color:var(--neutral-500)]" colSpan={6}>
                      No records match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
