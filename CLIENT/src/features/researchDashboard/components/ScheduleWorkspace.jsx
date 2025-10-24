import PropTypes from "prop-types";
import CalendarView from "../../../shared/components/calendar/CalendarView.jsx";

export default function ResearchScheduleWorkspace({ user }) {
  const userId = user?._id || user?.id || user?.userId || null;
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-[color:var(--neutral-900)]">My Schedule</h1>
        <p className="text-sm text-[color:var(--neutral-600)]">
          Track upcoming synopsis and defense sessions. Times are shown in Africa/Addis_Ababa (UTC+3).
        </p>
      </header>
      <CalendarView role="researcher" currentUserId={userId} />
    </section>
  );
}

ResearchScheduleWorkspace.propTypes = {
  user: PropTypes.object,
};
