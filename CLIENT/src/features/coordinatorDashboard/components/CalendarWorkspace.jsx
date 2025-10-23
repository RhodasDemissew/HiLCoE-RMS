import CalendarView from "../../../shared/components/calendar/CalendarView.jsx";

export default function CalendarWorkspace() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-[color:var(--neutral-900)]">Schedule Calendar</h1>
        <p className="text-sm text-[color:var(--neutral-600)]">
          Explore synopsis and defense events across the programme. Times shown in Africa/Addis_Ababa (UTC+3).
        </p>
      </header>
      <CalendarView role="coordinator" />
    </section>
  );
}

