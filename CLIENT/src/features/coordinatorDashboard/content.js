import dashboardIcon from "../../assets/icons/dashboard.png";
import usersIcon from "../../assets/icons/message.png";
import statsIcon from "../../assets/icons/reports.png";
import activityIcon from "../../assets/icons/submission.png";
import calendarIcon from "../../assets/icons/caldash.png";
import messageIcon from "../../assets/icons/chat.png";
import ResearchersIcon from "../../assets/icons/submission.png";
import supervisorsIcon from "../../assets/icons/dashboard.png";
import activeResearchIcon from "../../assets/icons/research.png";

export const coordinatorNav = [
  { label: "Dashboard", icon: dashboardIcon },
  { label: "Users", icon: usersIcon },
  { label: "Research Stats", icon: statsIcon },
  { label: "Activity Log", icon: activityIcon },
  { label: "Templates", icon: statsIcon },
  {
    label: "Schedule",
    icon: calendarIcon,
    children: [
      { label: "Synopsis Scheduling" },
      { label: "Defense Scheduling" },
      { label: "View Calendar" },
    ],
  },
  { label: "Message", icon: messageIcon },
];

export const coordinatorSummary = [
  { label: "Researchers", value: 56, trend: "+12", icon: ResearchersIcon },
  { label: "Supervisors", value: 20, trend: "+3", icon: supervisorsIcon },
  { label: "Active Research", value: 43, trend: "+8", icon: activeResearchIcon },
];

export const coordinatorActivity = [
  { date: "17/6/2025", author: "Supervisor", action: "Approved Proposal", description: "Approved Proposal for Group 12" },
  { date: "17/6/2025", author: "Group 13", action: "Submitted Report", description: "Submitted Progress Report" },
  { date: "17/6/2025", author: "Group 12", action: "Submitted Report", description: "Progress report received" },
];

export const coordinatorEvents = [
  { title: "Supervisor Meeting", date: "July 15, 2024", owner: "Prof. Smith" },
  { title: "Proposal Deadline", date: "July 15, 2024" },
  { title: "Upcoming Progress Report", date: "July 15, 2024" },
];

export const coordinatorMessages = [
  { id: 1, author: "Prof. Smith", role: "Supervisor", ago: "2h", body: "Great progress on the literature review. Please revise the methodology section." },
  { id: 2, author: "Dr. Smith", role: "Coordinator", ago: "2h", body: "Great progress on the literature review. Please revise the methodology section." },
  { id: 3, author: "Dr. Smith", role: "Coordinator", ago: "2h", body: "Great progress on the literature review. Please revise the methodology section." },
  { id: 4, author: "Dr. Smith", role: "Coordinator", ago: "2h", body: "Great progress on the literature review. Please revise the methodology section." },
];

export const coordinatorNotifications = [
  { id: 1, title: "New Submission", description: "Group 12 submitted a progress report", time: "5m" },
  { id: 2, title: "Supervisor Feedback", description: "Dr. Smith left a comment", time: "12m" },
];

export const coordinatorPerformance = [
  { label: "Figma", value: 120 },
  { label: "Sketch", value: 90 },
  { label: "XD", value: 70 },
  { label: "PS", value: 110 },
  { label: "AI", value: 130 },
];

export const coordinatorResearchSeries = [
  { year: "2020", values: [40, 35, 25, 30, 45] },
  { year: "2021", values: [50, 40, 45, 55, 60] },
  { year: "2022", values: [60, 55, 50, 70, 90] },
];

export const coordinatorResearchLabels = ["Figma", "Sketch", "XD", "PS", "AI"];

