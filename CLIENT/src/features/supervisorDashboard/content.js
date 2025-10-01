import dashboardIcon from "../../assets/icons/dashboard.png";
import reportsIcon from "../../assets/icons/reports.png";
import calendarIcon from "../../assets/icons/caldash.png";
import messageIcon from "../../assets/icons/message.png";

export const supNav = [
  { label: "Dashboard", icon: dashboardIcon },
  { label: "My Reviews", icon: reportsIcon },
  { label: "Calendar", icon: calendarIcon },
  { label: "Message", icon: messageIcon },
];

export const supKpis = [
  { title: "Students", value: 0 },
  { title: "Pending Reviews", value: 0 },
  { title: "Approved This Week", value: 0 },
  { title: "Needs Changes", value: 0 },
];

export const supCopy = {
  fallbackName: "Supervisor",
  welcomeMessage: "Today is a good day to make progress",
};

