import uploadIcon from "../../assets/icons/upload.png";
import calendarActionIcon from "../../assets/icons/calendar.png";
import chatActionIcon from "../../assets/icons/chat.png";
import downloadIcon from "../../assets/icons/download.png";
import reportsIcon from "../../assets/icons/reports.png";
import wordIcon from "../../assets/icons/word.png";
import dashboardIcon from "../../assets/icons/dashboard.png";
import submissionIcon from "../../assets/icons/submission.png";
import researchIcon from "../../assets/icons/research.png";
import calendarSidebarIcon from "../../assets/icons/caldash.png";
import messageIcon from "../../assets/icons/message.png";

export const dashboardNavItems = [
  { label: "Dashboard", icon: dashboardIcon },
  { label: "Submission", icon: submissionIcon },
  { label: "My Research", icon: researchIcon },
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
  { icon: calendarActionIcon, label: "Schedule Meeting", sublabel: "Book supervisor meeting" },
  { icon: wordIcon, label: "View Templates", sublabel: "Browse document templates" },
  { icon: chatActionIcon, label: "Contact Support", sublabel: "Get help and guidance" },
  { icon: reportsIcon, label: "Progress Report", sublabel: "Generate progress insight" },
  { icon: downloadIcon, label: "Export Data", sublabel: "Download your data" },
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

export const dashboardNotifications = [];

export const dashboardCopy = {
  fallbackName: "Researcher",
  loadingTitle: "Loading profile?",
  welcomeMessage: "Here's what's happening with your research today.",
};


