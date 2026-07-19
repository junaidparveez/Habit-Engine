import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { Box, CircularProgress } from "@mui/material";
import { ROUTES } from "../constants";

// Auth pages (eagerly loaded for fast initial experience)
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

// App pages — lazy loaded for better bundle splitting
const Dashboard = lazy(() => import("../pages/Dashboard"));
const HabitsPage = lazy(() => import("../pages/HabitsPage"));
const StatisticsPage = lazy(() => import("../pages/StatisticsPage"));
const GoalsPage = lazy(() => import("../pages/GoalsPage"));
const RoutinePage = lazy(() => import("../pages/RoutinePage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const SocialPage = lazy(() => import("../pages/SocialPage"));
const GroupDashboardPage = lazy(() => import("../pages/GroupDashboardPage"));
const DirectMessagePage = lazy(() => import("../pages/DirectMessagePage"));

const PageLoader = () => (
  <Box
    sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}
  >
    <CircularProgress sx={{ color: "#8B5CF6" }} />
  </Box>
);

/**
 * Application router configuration.
 * Uses React Router v7 with data router (createBrowserRouter).
 * Protected routes require authentication via JWT (handled by ProtectedRoute).
 * App pages are lazy-loaded for optimal bundle splitting.
 */
const router = createBrowserRouter([
  // Public auth routes
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.REGISTER,
    element: <RegisterPage />,
  },
  // Protected app routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: (
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: ROUTES.HABITS,
            element: (
              <Suspense fallback={<PageLoader />}>
                <HabitsPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.STATISTICS,
            element: (
              <Suspense fallback={<PageLoader />}>
                <StatisticsPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.GOALS,
            element: (
              <Suspense fallback={<PageLoader />}>
                <GoalsPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.ROUTINE,
            element: (
              <Suspense fallback={<PageLoader />}>
                <RoutinePage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.SETTINGS,
            element: (
              <Suspense fallback={<PageLoader />}>
                <SettingsPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.SOCIAL,
            element: (
              <Suspense fallback={<PageLoader />}>
                <SocialPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.GROUP_DASHBOARD,
            element: (
              <Suspense fallback={<PageLoader />}>
                <GroupDashboardPage />
              </Suspense>
            ),
          },
          {
            path: ROUTES.MESSAGES,
            element: (
              <Suspense fallback={<PageLoader />}>
                <DirectMessagePage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  // Fallback
  {
    path: "*",
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
]);

export default router;
