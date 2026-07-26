/**
 * Application-wide constants.
 */

export const API_BASE_URL = "http://localhost:8080/api/v1";

export const DRAWER_WIDTH = 260;

export const ROUTES = {
  DASHBOARD: "/",
  HABITS: "/habits",
  STATISTICS: "/statistics",
  GOALS: "/goals",
  ROUTINE: "/routine",
  SETTINGS: "/settings",
  LOGIN: "/login",
  REGISTER: "/register",
  SOCIAL: "/social",
  GROUP_DASHBOARD: "/groups/:id",
  MESSAGES: "/messages/:userId",
  AI: "/ai",
};

export const NAV_ITEMS = [
  { label: "Dashboard", path: ROUTES.DASHBOARD, icon: "Dashboard", section: "OVERVIEW" },
  { label: "AI Planner", path: ROUTES.AI, icon: "AutoAwesome", section: "OVERVIEW" },
  { label: "Daily Routine", path: ROUTES.ROUTINE, icon: "AccessTime", section: "TRACKING & ROUTINE" },
  { label: "Habits", path: ROUTES.HABITS, icon: "FitnessCenter", section: "TRACKING & ROUTINE" },
  { label: "Goals", path: ROUTES.GOALS, icon: "Flag", section: "PROGRESS & ANALYTICS" },
  { label: "Statistics", path: ROUTES.STATISTICS, icon: "BarChart", section: "PROGRESS & ANALYTICS" },
  { label: "Community", path: ROUTES.SOCIAL, icon: "Group", section: "COMMUNITY" },
];
