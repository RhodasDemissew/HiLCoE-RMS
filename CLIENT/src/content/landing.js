import monitorFrame from "../assets/images/monitorbg.png";
import dashboardScreen from "../assets/images/dashboardScreen.png";
import logoImage from "../assets/images/logo.png";
import featureAI from "../assets/images/feature-ai.png";
import featureChat from "../assets/images/feature-chat.png";
import featureArchive from "../assets/images/feature-archive.png";
import aboutIllustration from "../assets/images/about-illustration.png";

export const NAV = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "About Us", href: "#about" },
  { label: "Road Map", href: "#roadmap" },
  { label: "FAQs", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const hero = {
  line1: ["Simplifying Academic ", { bold: "Research" }],
  line2: [{ bold: "Management System" }],
  subtitle: "Plan, monitor, and evaluate research projects from start to submission - powered by AI.",
  primary: { label: "Get Started", href: "/signup" },
  mockup: {
    src: monitorFrame,
    screen: dashboardScreen,
    alt: "Dashboard mockup",
    width: 980,
    height: 580,
  },
};

export const features = {
  eyebrow: "Academic Research Assisted With Artificial Intelligence",
  subtitle:
    "Proposal submission, supervisor feedback, AI paper checker, progress tracking.",
  items: [
    {
      icon: featureAI,
      title: "Smart AI/NLP-driven analysis",
      copy: "Our system integrates AI and NLP for intelligent insights.",
    },
    {
      icon: featureChat,
      title: "Instant expert communication",
      copy: "Real-time chat with advisors for expert guidance.",
    },
    {
      icon: featureArchive,
      title: "Organized, searchable knowledge hub",
      copy: "Smart research archive for easy discovery and retrieval of past studies.",
    },
  ],
};

export const about = {
  title: "About Us",
  headline: "Empowering researchers with intelligent management tools.",
  paragraphs: [
    "At HiLCoE School Research Management we empower researchers, academics, and professionals with an intelligent research management system designed to streamline knowledge discovery, collaboration, and analysis.",
    "Our platform combines AI and NLP-driven insights to help you uncover patterns and trends effortlessly. Initiate live chat support from expert advisors, and access your research archive whenever you need it most. With our smart research archive your work stays organized, searchable, and easily accessible - saving you time and boosting productivity.",
    "Whether you are an individual scholar, research team, or an institution, we are here to simplify your workflow and accelerate innovation.",
  ],
  image: {
    src: aboutIllustration,
    alt: "Researchers collaborating with AI",
  },
};

export const roadmap = {
  title: "Research Road Map",
  intro:
    "Follow a guided path from idea to archiving with checkpoints for collaboration and review.",
  steps: [
    {
      title: "Synopsis Drafting",
      copy: "A brief overview (1-2 pages) of your research.",
    },
    {
      title: "Literature Review",
      copy: "Identify key themes, gaps, and related works.",
    },
    {
      title: "Research Methodology Design",
      copy: "Proposed methods (qualitative/quantitative).",
    },
    {
      title: "Drafting & Submitting Research Papers",
      copy: "Gain feedback from the scholarly community and establish your expertise.",
    },
    {
      title: "Data Collection",
      copy: "Track collection progress and analytic techniques.",
    },
    {
      title: "Verification & Plagiarism Check",
      copy: "Quality control stage that refines and validates your research question.",
    },
    {
      title: "Feedback and Final Approval",
      copy: "Present your refined proposal to your advisor or committee for formal review.",
    },
    {
      title: "Archiving",
      copy: "Systematically organize and preserve your research data, notes, and materials.",
    },
  ],
};

export const faq = {
  heroTitle: "Frequently Asked Questions",
  placeholder: "Search question",
  items: [
    {
      question: "How do I get started?",
      answer:
        "Once your verification is approved, create your account with your Gmail address to access the researcher dashboard and onboarding checklist.",
    },
    {
      question: "What features does it have?",
      answer:
        "The platform covers proposal submission, supervisor feedback, AI-powered plagiarism checks, progress tracking, and an organized research archive.",
    },
    {
      question: "How can I submit a file?",
      answer:
        "Navigate to your project workspace, choose Submit Document, and upload your draft in PDF or DOCX format for supervisor review.",
    },
    {
      question: "Can supervisors give feedback online?",
      answer:
        "Yes. Supervisors review your submissions directly in the portal and leave annotated feedback and action items for you to address.",
    },
  ],
};

export const contact = {
  title: "Get in",
  highlight: "touch with us",
  intro:
    "Were here to help! Whether you have a question about our services, need assistance with your account, or want to provide feedback, our team is ready to assist you.",
  sections: [
    {
      label: "Reception / Admin",
      lines: [
        "info@hilcoe.net, www.hilcoe.net",
        "+251 111 564900, +251 111 564888",
        "Short Professional Course enquiry",
      ],
    },
    {
      label: "Cyber Security",
      lines: [
        "cyberinfo@hilcoe.net / cyberinfohilcoe@gmail.com",
        "+251 987 03 03 03 / +251 986 04 04 04",
      ],
    },
  ],
};

export const footer = {
  logo: {
    src: logoImage,
    alt: "HiLCoE logo",
    name: "HiLCoE",
    tagline: "School Research Management System",
  },
  hours: [
    "Mon-Sat: Morning",
    "8:30 AM - 12:30 PM",
    "Mon-Fri: Afternoon",
    "2:00 PM - 5:00 PM",
  ],
  pages: [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "About Us", href: "#about" },
    { label: "Contact Us", href: "/contact" },
  ],
  contact: {
    address: "Arat Kilo, General Wingate St., Next to Abrehot Library.",
    email: "info@hilcoe.net",
    phones: ["+251 111564888", "+251 111564900", "+251 111559769"],
  },
};
