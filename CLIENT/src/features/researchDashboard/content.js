import uploadIcon from "../../assets/icons/upload.png";
import calendarActionIcon from "../../assets/icons/calendar.png";
import downloadIcon from "../../assets/icons/download.png";
import reportsIcon from "../../assets/icons/reports.png";
import wordIcon from "../../assets/icons/word.png";
import dashboardIcon from "../../assets/icons/dashboard.png";
import submissionIcon from "../../assets/icons/submission.png";
import calendarSidebarIcon from "../../assets/icons/caldash.png";
import messageIcon from "../../assets/icons/message.png";
import settingsIcon from "../../assets/icons/settings.png";

export const dashboardNavItems = [
  { label: "Dashboard", icon: dashboardIcon },
  { label: "Submission", icon: submissionIcon },
  { label: "Templates", icon: wordIcon },
  { label: "Schedule", icon: calendarSidebarIcon },
  { label: "Message", icon: messageIcon },
];

export const dashboardKpiCards = [
  { title: "Total Submissions", value: 0 },
  { title: "Pending Reviews", value: 0 },
  { title: "Completed Tasks", value: 0 },
  { title: "Overdue Items", value: 0 },
];

export const dashboardQuickActions = [
  { icon: uploadIcon, label: "New Submission", sublabel: "Submit research documents" },
  { icon: wordIcon, label: "View Templates", sublabel: "Browse document templates" },
  { icon: messageIcon, label: "Messages", sublabel: "Chat with supervisors" },
];

export const dashboardMilestones = [
  { label: "Synopsis", percent: 0, status: "Pending" },
  { label: "Proposal", percent: 0, status: "Pending" },
  { label: "Progress 1", percent: 0, status: "Pending" },
];

export const dashboardChartLabels = ["Figma", "Sketch", "XD", "PS", "AI"];

export const dashboardChartSeries = [
  { name: "Submissions", data: [0, 0, 0, 0, 0] },
  { name: "Approvals", data: [0, 0, 0, 0, 0] },
];

export const researcherMessages = [
  { id: 1, author: "Dr. Johnson", role: "Supervisor", ago: "2h", body: "Great progress on the literature review. Please revise the methodology section." },
  { id: 2, author: "Prof. Smith", role: "Supervisor", ago: "4h", body: "Your proposal looks good. Let's schedule a meeting to discuss the next steps." },
  { id: 3, author: "Dr. Brown", role: "Coordinator", ago: "1d", body: "Please submit your progress report by the end of the week." },
];

export const dashboardNotifications = [];

export const dashboardCopy = {
  fallbackName: "Researcher",
  loadingTitle: "Loading profile?",
  welcomeMessage: "Here's what's happening with your research today.",
  messages: researcherMessages,
};


