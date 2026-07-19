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
};

export const NAV_ITEMS = [
  { label: "Dashboard", path: ROUTES.DASHBOARD, icon: "Dashboard" },
  { label: "Daily Routine", path: ROUTES.ROUTINE, icon: "AccessTime" },
  { label: "Habits", path: ROUTES.HABITS, icon: "FitnessCenter" },
  { label: "Statistics", path: ROUTES.STATISTICS, icon: "BarChart" },
  { label: "Goals", path: ROUTES.GOALS, icon: "Flag" },
  { label: "Community", path: ROUTES.SOCIAL, icon: "Group" },
];
