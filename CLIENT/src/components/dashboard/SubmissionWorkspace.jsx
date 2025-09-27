import { useMemo, useState } from "react";
import uploadIcon from "../../assets/icons/upload.png";
import wordIcon from "../../assets/icons/word.png";

const SUBMISSION_FILES = [
  { name: "Synopsis.doc", type: "Synopsis submission", date: "Aug 8, 2025", size: "234 KB" },
  { name: "Synopsis_2.doc", type: "Synopsis submission", date: "Aug 8, 2025", size: "234 KB" },
  { name: "Proposal.doc", type: "Proposal submission", date: "Aug 8, 2025", size: "234 KB" },
];

export default function SubmissionWorkspace() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredFiles = useMemo(() => {
    if (!normalizedQuery) {
      return SUBMISSION_FILES;
    }

    return SUBMISSION_FILES.filter((file) =>
      file.name.toLowerCase().includes(normalizedQuery) ||
      file.type.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  function handleFileChange(event) {
    const files = Array.from(event.target.files || []);
    console.log("Selected files", files);
  }

  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12">
        <header className="card rounded-card border border-transparent bg-white px-8 py-6 shadow-soft">
          <h1 className="h2 text-[color:var(--neutral-900)]">Submission</h1>
        </header>
      </div>

      <div className="col-span-12">
        <section className="card rounded-card border border-muted bg-white shadow-soft px-8 py-6">
          <label
            htmlFor="submission-upload"
            className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[color:var(--brand-600)]/30 bg-[color:var(--brand-600)]/5 px-8 py-14 text-center transition hover:border-[color:var(--brand-600)] hover:bg-[color:var(--brand-600)]/10"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--brand-600)]/10">
              <img src={uploadIcon} alt="" className="h-8 w-8" loading="lazy" decoding="async" aria-hidden />
            </div>
            <p className="mt-4 text-sm font-semibold text-[color:var(--neutral-800)]">Upload File or Drag it here</p>
            <p className="mt-2 text-xs text-[color:var(--neutral-500)]">Supported formats: DOCX, PDF. Max 50 MB.</p>
          </label>
          <input id="submission-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
        </section>
      </div>

      <div className="col-span-12">
        <section className="card rounded-card border border-muted bg-white shadow-soft px-0 py-0">
          <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="h3 text-[color:var(--neutral-900)]">Attached Files</h2>
              <p className="body mt-1 text-[color:var(--neutral-600)]">Here you can explore your uploaded files.</p>
            </div>
            <div className="relative w-full max-w-xs">
              <input
                type="search"
                placeholder="Search file"
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
                  <th className="px-6 py-3 font-semibold">File Type</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">File Size</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <tr key={file.name} className="border-t border-[color:var(--neutral-200)] hover:bg-[color:var(--neutral-100)]/60">
                    <td className="px-6 py-3 font-medium text-[color:var(--neutral-900)]">
                      <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--brand-600)]/10">
                        <img src={wordIcon} alt="" className="h-4 w-4" loading="lazy" decoding="async" aria-hidden />
                      </span>
                      {file.name}
                    </td>
                    <td className="px-6 py-3">{file.type}</td>
                    <td className="px-6 py-3">{file.date}</td>
                    <td className="px-6 py-3">{file.size}</td>
                  </tr>
                ))}
                {filteredFiles.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-center text-sm text-[color:var(--neutral-500)]" colSpan={4}>
                      No files match your search.
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
