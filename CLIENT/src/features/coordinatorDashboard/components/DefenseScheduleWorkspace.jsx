import { useEffect, useMemo, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { api } from "../../../api/client.js";

const TZ = "Africa/Addis_Ababa";
dayjs.extend(utc);
dayjs.extend(timezone);

const modalityOptions = [
  { value: "in-person", label: "In-Person" },
  { value: "online", label: "Online" },
  { value: "hybrid", label: "Hybrid" },
];

const formSchema = z
  .object({
    title: z.string().trim().min(3, "Title is required"),
    researcherId: z.string().min(1, "Select a researcher"),
    examinerIds: z.array(z.string()).min(1, "Select at least one panelist"),
    supervisorId: z.string().optional(),
    date: z.string().regex(/\d{4}-\d{2}-\d{2}/, "Pick a date"),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm"),
    durationMins: z.coerce.number().int().min(15, "Minimum 15 minutes").max(480, "Duration too long"),
    bufferMins: z.coerce.number().int().min(0).max(480),
    modality: z.enum(["in-person", "online", "hybrid"]),
    venue: z.string().trim().optional(),
    meetingLink: z.string().trim().optional(),
    notes: z.string().trim().max(2000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.modality === "in-person" && !data.venue) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["venue"], message: "Venue required for in-person" });
    }
    if (data.modality === "online" && !data.meetingLink) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["meetingLink"], message: "Meeting link required for online" });
    }
    if (data.modality === "hybrid" && !data.venue && !data.meetingLink) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["venue"], message: "Provide a venue and/or meeting link" });
    }
  });

const emptyConflicts = { loading: false, ids: [], slots: [], error: "" };

const defaultFormValues = () => ({
  title: "",
  researcherId: "",
  examinerIds: [],
  supervisorId: "",
  date: dayjs().tz(TZ).add(1, "day").format("YYYY-MM-DD"),
  startTime: "09:00",
  durationMins: 60,
  bufferMins: 15,
  modality: "in-person",
  venue: "",
  meetingLink: "",
  notes: "",
});

function formatRange(startIso, durationMins) {
  const start = dayjs(startIso).tz(TZ);
  const end = start.add(durationMins || 60, "minute");
  return `${start.format("MMM D, YYYY")} ${start.format("HH:mm")} - ${end.format("HH:mm")} (UTC+3)`;
}

function statusBadge(status) {
  const meta =
    {
      scheduled: "bg-emerald-100 text-emerald-700",
      cancelled: "bg-red-100 text-red-700",
    }[status] || "bg-[color:var(--neutral-200)] text-[color:var(--neutral-700)]";
  const label = status ? status.replace(/_/g, " ") : "Unknown";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${meta}`}>{label}</span>;
}

function Toast({ toast, onDismiss }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl bg-[color:var(--neutral-900)]/90 px-4 py-3 text-sm text-white shadow-lg" role="status">
      <div className="flex items-start gap-3">
        <span className="mt-[2px] inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" aria-hidden></span>
        <div>
          <p className="font-semibold">{toast.title || "Update"}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-white/80">{toast.message}</p>
        </div>
        <button type="button" className="ml-4 text-xs font-semibold uppercase tracking-wide text-white/60 hover:text-white" onClick={onDismiss}>
          Close
        </button>
      </div>
    </div>
  );
}

export default function DefenseScheduleWorkspace() {
  const [defenses, setDefenses] = useState([]);
  const [defenseError, setDefenseError] = useState("");
  const [loadingDefenses, setLoadingDefenses] = useState(true);
  const [people, setPeople] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [peopleError, setPeopleError] = useState("");
  const [toast, setToast] = useState(null);
  const [formMode, setFormMode] = useState("create");
  const [activeId, setActiveId] = useState(null);
  const [showCancelled, setShowCancelled] = useState(false);
  const [conflicts, setConflicts] = useState(emptyConflicts);
  const [availabilityVersion, setAvailabilityVersion] = useState(0);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues(),
  });

  const watchValues = useWatch({
    control,
    name: ["date", "startTime", "durationMins", "bufferMins", "researcherId", "examinerIds", "supervisorId"],
  });
  const watchSignature = JSON.stringify(watchValues);

  const researcherOptions = useMemo(
    () => people.filter((p) => (p.role || "").toLowerCase().includes("researcher")),
    [people]
  );

  const panelistOptions = useMemo(
    () => people.filter((p) => /(supervisor|examiner|advisor|coordinator)/i.test(p.role || "")),
    [people]
  );

  const userLookup = useMemo(() => {
    const map = new Map();
    people.forEach((p) => map.set(String(p.id || p._id || p.email), p));
    return map;
  }, [people]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function loadPeople() {
    setLoadingPeople(true);
    setPeopleError("");
    try {
      const res = await api("/users");
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.error || "Failed to load users");
      setPeople(Array.isArray(data) ? data : []);
    } catch (err) {
      setPeopleError(err.message || "Failed to load users");
    } finally {
      setLoadingPeople(false);
    }
  }

  async function loadDefenses() {
    setLoadingDefenses(true);
    setDefenseError("");
    try {
      const res = await api("/defense?includeCancelled=true");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load defenses");
      setDefenses(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      setDefenseError(err.message || "Failed to load defenses");
    } finally {
      setLoadingDefenses(false);
    }
  }

  useEffect(() => {
    loadPeople();
    loadDefenses();
  }, []);

  const visibleDefenses = useMemo(() => {
    const sorted = [...defenses].sort((a, b) => dayjs(a.startAt).valueOf() - dayjs(b.startAt).valueOf());
    return showCancelled ? sorted : sorted.filter((d) => d.status !== "cancelled");
  }, [defenses, showCancelled]);

  function handleEdit(defense) {
    const startLocal = dayjs(defense.startAt).tz(TZ);
    reset({
      title: defense.title || "",
      researcherId: defense.candidateId || "",
      examinerIds: defense.panelistIds || [],
      supervisorId: defense.supervisorId || "",
      date: startLocal.format("YYYY-MM-DD"),
      startTime: startLocal.format("HH:mm"),
      durationMins: defense.durationMins || 60,
      bufferMins: defense.bufferMins ?? 15,
      modality: defense.modality || "in-person",
      venue: defense.venue || "",
      meetingLink: defense.meetingLink || "",
      notes: defense.notes || "",
    });
    setFormMode("edit");
    setActiveId(defense.id);
    setConflicts({ ...emptyConflicts });
    setAvailabilityVersion((v) => v + 1);
  }

  function resetForm() {
    reset(defaultFormValues());
    setFormMode("create");
    setActiveId(null);
    setConflicts({ ...emptyConflicts });
    setAvailabilityVersion((v) => v + 1);
  }

  async function onSubmit(values) {
    const payload = {
      title: values.title,
      researcherId: values.researcherId,
      examinerIds: values.examinerIds,
      supervisorId: values.supervisorId || undefined,
      date: values.date,
      startTime: values.startTime,
      durationMins: Number(values.durationMins),
      bufferMins: Number(values.bufferMins),
      modality: values.modality,
      venue: values.venue,
      meetingLink: values.meetingLink,
      notes: values.notes,
    };
    try {
      let res;
      if (formMode === "edit" && activeId) {
        res = await api(`/defense/${activeId}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        res = await api("/defense", { method: "POST", body: JSON.stringify(payload) });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to save defense");
      setToast({ title: "Defense saved", message: formMode === "edit" ? "Defense updated." : "Defense scheduled." });
      resetForm();
      loadDefenses();
    } catch (err) {
      setToast({ title: "Error", message: err.message || "Unable to save defense" });
    }
  }

  async function handleDuplicate(defense) {
    try {
      const res = await api(`/defense/${defense.id}/duplicate`, { method: "POST", body: JSON.stringify({}) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to duplicate");
      setToast({ title: "Defense duplicated", message: `${defense.title} copied.` });
      loadDefenses();
    } catch (err) {
      setToast({ title: "Error", message: err.message || "Unable to duplicate defense" });
    }
  }

  async function handleCancel(defense) {
    if (!window.confirm(`Cancel defense "${defense.title}"?`)) return;
    try {
      const res = await api(`/defense/${defense.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to cancel");
      setToast({ title: "Defense cancelled", message: `${defense.title} marked as cancelled.` });
      if (activeId === defense.id) resetForm();
      loadDefenses();
    } catch (err) {
      setToast({ title: "Error", message: err.message || "Unable to cancel defense" });
    }
  }

  useEffect(() => {
    const [date, startTime, durationMins, , researcherId, examinerIds, supervisorId] = Array.isArray(watchValues) ? watchValues : [];
    if (!date || !startTime || !researcherId || !Array.isArray(examinerIds)) {
      setConflicts({ ...emptyConflicts });
      return;
    }
    const participants = new Set([researcherId, ...(examinerIds || [])]);
    if (supervisorId) participants.add(supervisorId);
    const userIds = Array.from(participants).filter(Boolean);
    if (!userIds.length) {
      setConflicts({ ...emptyConflicts });
      return;
    }
    const duration = Number(durationMins || 60);
    const query = new URLSearchParams({ date, userIds: userIds.join(",") });
    const controller = new AbortController();
    setConflicts((prev) => ({ ...prev, loading: true, error: "" }));
    const timer = setTimeout(async () => {
      try {
        const res = await api(`/availability?${query.toString()}`, { signal: controller.signal });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to load availability");
        const items = Array.isArray(data?.items) ? data.items : [];
        const startUtc = dayjs.tz(`${date} ${startTime}`, "YYYY-MM-DD HH:mm", TZ).utc();
        const endUtc = startUtc.add(duration, "minute");
        const busy = items.filter((slot) => {
          const slotStart = dayjs(slot.startAt);
          const slotEnd = dayjs(slot.endAt);
          return slotStart.isValid() && slotEnd.isValid() && slotStart.isBefore(endUtc) && slotEnd.isAfter(startUtc);
        });
        const ids = Array.from(new Set(busy.flatMap((slot) => slot.people || [])));
        setConflicts({ loading: false, ids, slots: busy, error: "" });
      } catch (err) {
        if (controller.signal.aborted) return;
        setConflicts({ loading: false, ids: [], slots: [], error: err.message || "Availability lookup failed" });
      }
    }, 400);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [watchSignature, availabilityVersion]);

  const selectedPeople = useMemo(() => {
    const [, , , , researcherId, examinerIds, supervisorId] = Array.isArray(watchValues) ? watchValues : [];
    const set = new Set();
    if (researcherId) set.add(String(researcherId));
    (examinerIds || []).forEach((id) => id && set.add(String(id)));
    if (supervisorId) set.add(String(supervisorId));
    return Array.from(set);
  }, [watchSignature]);

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2px font-semibold text-[color:var(--neutral-900)] text-2xl">Defense Scheduling</h1>
          <p className="text-sm text-[color:var(--neutral-600)]">Schedule and manage defenses. All times are displayed in UTC+3.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-xl border border-[color:var(--neutral-200)] px-4 py-2 text-sm font-semibold text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-100)]"
            onClick={() => {
              loadDefenses();
              setAvailabilityVersion((v) => v + 1);
            }}
          >
            Refresh
          </button>
          <button
            type="button"
            className="rounded-xl border border-[color:var(--neutral-200)] px-4 py-2 text-sm font-semibold text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-100)]"
            onClick={resetForm}
          >
            New Defense
          </button>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold text-[color:var(--neutral-900)]">{formMode === "edit" ? "Update Defense" : "Create New Defense"}</h2>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-[color:var(--neutral-800)]">Title</span>
                <input
                  type="text"
                  className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-3 py-2 text-sm"
                  placeholder="Final Defense"
                  {...register("title")}
                />
                {errors.title && <p className="mt-1 text-xs font-semibold text-red-600">{errors.title.message}</p>}
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[color:var(--neutral-800)]">Researcher</span>
                <select
                  className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-3 py-2 text-sm"
                  {...register("researcherId")}
                >
                  <option value="">Select researcher</option>
                  {researcherOptions.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name || person.email}
                    </option>
                  ))}
                </select>
                {errors.researcherId && <p className="mt-1 text-xs font-semibold text-red-600">{errors.researcherId.message}</p>}
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[color:var(--neutral-800)]">Date</span>
                <input
                  type="date"
                  min={dayjs().tz(TZ).format("YYYY-MM-DD")}
                  className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-3 py-2 text-sm"
                  {...register("date")}
                />
                {errors.date && <p className="mt-1 text-xs font-semibold text-red-600">{errors.date.message}</p>}
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[color:var(--neutral-800)]">
                  Start Time <span className="font-normal text-xs text-[color:var(--neutral-500)]">(UTC+3)</span>
                </span>
                <input
                  type="time"
                  className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-3 py-2 text-sm"
                  {...register("startTime")}
                />
                {errors.startTime && <p className="mt-1 text-xs font-semibold text-red-600">{errors.startTime.message}</p>}
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[color:var(--neutral-800)]">Duration (minutes)</span>
                <input
                  type="number"
                  min={15}
                  step={15}
                  className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-3 py-2 text-sm"
                  {...register("durationMins", { valueAsNumber: true })}
                />
                {errors.durationMins && <p className="mt-1 text-xs font-semibold text-red-600">{errors.durationMins.message}</p>}
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[color:var(--neutral-800)]">Buffer (minutes)</span>
                <input
                  type="number"
                  min={0}
                  step={5}
                  className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-3 py-2 text-sm"
                  {...register("bufferMins", { valueAsNumber: true })}
                />
                {errors.bufferMins && <p className="mt-1 text-xs font-semibold text-red-600">{errors.bufferMins.message}</p>}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="examinerIds"
                render={({ field }) => (
                  <label className="block sm:col-span-2">
                    <span className="text-sm font-semibold text-[color:var(--neutral-800)]">Panelists</span>
                    <select
                      multiple
                      className="mt-1 h-32 w-full rounded-xl border border-[color:var(--neutral-200)] px-3 py-2 text-sm"
                      value={field.value}
                      onChange={(event) => {
                        const values = Array.from(event.target.selectedOptions, (opt) => opt.value);
                        field.onChange(values);
                      }}
                    >
                      {panelistOptions.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.name || person.email}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-[color:var(--neutral-500)]">Hold Ctrl (Windows) or Command (Mac) to select multiple panelists.</p>
                    {errors.examinerIds && <p className="mt-1 text-xs font-semibold text-red-600">{errors.examinerIds.message}</p>}
                  </label>
                )}
              />

              <label className="block">
                <span className="text-sm font-semibold text-[color:var(--neutral-800)]">Supervisor (optional)</span>
                <select
                  className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-3 py-2 text-sm"
                  {...register("supervisorId")}
                >
                  <option value="">Not assigned</option>
                  {panelistOptions.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name || person.email}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-[color:var(--neutral-800)]">Modality</span>
                <select
                  className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-3 py-2 text-sm"
                  {...register("modality")}
                >
                  {modalityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-[color:var(--neutral-800)]">Venue</span>
                <input
                  type="text"
                  placeholder="Room 101"
                  className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-3 py-2 text-sm"
                  {...register("venue")}
                />
                {errors.venue && <p className="mt-1 text-xs font-semibold text-red-600">{errors.venue.message}</p>}
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-[color:var(--neutral-800)]">Meeting Link</span>
                <input
                  type="url"
                  placeholder="https://"
                  className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-3 py-2 text-sm"
                  {...register("meetingLink")}
                />
                {errors.meetingLink && <p className="mt-1 text-xs font-semibold text-red-600">{errors.meetingLink.message}</p>}
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-[color:var(--neutral-800)]">Notes</span>
              <textarea
                rows={3}
                placeholder="Optional notes for the panel"
                className="mt-1 w-full rounded-xl border border-[color:var(--neutral-200)] px-3 py-2 text-sm"
                {...register("notes")}
              />
              {errors.notes && <p className="mt-1 text-xs font-semibold text-red-600">{errors.notes.message}</p>}
            </label>

            <div className="rounded-2xl border border-[color:var(--neutral-200)] bg-[color:var(--neutral-50)] px-4 py-3 text-sm">
              <div className="font-semibold text-[color:var(--neutral-800)]">Panelist availability</div>
              <p className="mt-1 text-xs text-[color:var(--neutral-500)]">Green indicates availability; red indicates a conflict within the selected slot.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedPeople.map((id) => {
                  const person = userLookup.get(String(id));
                  const name = person?.name || person?.email || id;
                  const hasConflict = conflicts.ids.includes(String(id));
                  return (
                    <span
                      key={id}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                        hasConflict ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      <span className={`inline-block h-2 w-2 rounded-full ${hasConflict ? "bg-red-500" : "bg-emerald-500"}`} aria-hidden></span>
                      {name}
                    </span>
                  );
                })}
              </div>
              {conflicts.loading && <p className="mt-2 text-xs text-[color:var(--neutral-500)]">Checking availability...</p>}
              {conflicts.error && <p className="mt-2 text-xs font-semibold text-red-600">{conflicts.error}</p>}
              {!conflicts.loading && !conflicts.error && conflicts.ids.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-[color:var(--neutral-600)]">
                  {conflicts.slots.map((slot, idx) => (
                    <li key={`${slot.startAt}-${idx}`}>
                      Busy {dayjs(slot.startAt).tz(TZ).format("MMM D HH:mm")} - {dayjs(slot.endAt).tz(TZ).format("HH:mm")} (
                      {(slot.people || []).map((pid) => userLookup.get(String(pid))?.name || pid).join(", ")})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-[color:var(--brand-600)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {formMode === "edit" ? (isSubmitting ? "Updating..." : "Update Defense") : isSubmitting ? "Scheduling..." : "Schedule Defense"}
              </button>
              {formMode === "edit" && (
                <button type="button" className="text-sm font-semibold text-[color:var(--neutral-600)] hover:text-[color:var(--neutral-800)]" onClick={resetForm}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[color:var(--neutral-900)]">Scheduled defenses</h2>
              <p className="text-xs text-[color:var(--neutral-500)]">Manage upcoming sessions and notify panelists.</p>
            </div>
            <label className="flex items-center gap-2 text-xs text-[color:var(--neutral-600)]">
              <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} />
              Show cancelled
            </label>
          </div>

          {defenseError && <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{defenseError}</div>}
          {loadingDefenses ? (
            <div className="py-10 text-center text-sm text-[color:var(--neutral-500)]">Loading defenses...</div>
          ) : visibleDefenses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[color:var(--neutral-200)] bg-[color:var(--neutral-50)] py-10 text-center text-sm text-[color:var(--neutral-500)]">
              No defenses scheduled yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[color:var(--neutral-200)]">
              <table className="min-w-full divide-y divide-[color:var(--neutral-200)] text-left text-sm">
                <thead className="bg-[color:var(--neutral-50)]">
                  <tr className="text-[color:var(--neutral-600)]">
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">When</th>
                    <th className="px-4 py-3 font-semibold">Participants</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--neutral-200)]">
                  {visibleDefenses.map((defense) => {
                    const participants = [
                      defense.candidateId,
                      ...(defense.panelistIds || []),
                      defense.supervisorId,
                    ].filter(Boolean);
                    return (
                      <tr key={defense.id} className="text-[color:var(--neutral-800)]">
                        <td className="px-4 py-3 font-semibold">{defense.title}</td>
                        <td className="px-4 py-3 text-sm text-[color:var(--neutral-600)]">{formatRange(defense.startAt, defense.durationMins)}</td>
                        <td className="px-4 py-3 text-sm text-[color:var(--neutral-600)]">
                          <div className="flex flex-wrap gap-1">
                            {participants.map((id) => {
                              const person = userLookup.get(String(id));
                              return (
                                <span key={id} className="inline-flex items-center rounded-full bg-[color:var(--neutral-100)] px-2 py-0.5 text-xs">
                                  {person?.name || person?.email || id}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3">{statusBadge(defense.status)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button type="button" className="text-xs font-semibold text-[color:var(--brand-600)] hover:underline" onClick={() => handleEdit(defense)}>
                              Edit
                            </button>
                            <button type="button" className="text-xs font-semibold text-[color:var(--brand-600)] hover:underline" onClick={() => handleDuplicate(defense)}>
                              Duplicate
                            </button>
                            <button
                              type="button"
                              className="text-xs font-semibold text-red-600 hover:underline disabled:text-[color:var(--neutral-400)]"
                              onClick={() => handleCancel(defense)}
                              disabled={defense.status === "cancelled"}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {peopleError && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{peopleError}</div>}
      {loadingPeople && <div className="text-xs text-[color:var(--neutral-500)]">Loading panelists...</div>}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </section>
  );
}
