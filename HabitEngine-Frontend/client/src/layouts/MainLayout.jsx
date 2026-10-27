import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
  Avatar,
  Tooltip,
  Snackbar,
  Alert,
  LinearProgress,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/SpaceDashboardOutlined";
import HabitsIcon from "@mui/icons-material/TaskAltOutlined";
import StatsIcon from "@mui/icons-material/InsightsOutlined";
import GoalsIcon from "@mui/icons-material/FlagOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeIcon from "@mui/icons-material/LightModeOutlined";
import GroupIcon from "@mui/icons-material/GroupsOutlined";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import AccessTimeIcon from "@mui/icons-material/ScheduleOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { DRAWER_WIDTH, NAV_ITEMS } from "../constants";
import { useThemeMode } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import useWebSocket from "../hooks/useWebSocket";
import BrandLogo from "../components/common/BrandLogo";

const iconMap = {
  Dashboard: DashboardIcon,
  AccessTime: AccessTimeIcon,
  FitnessCenter: HabitsIcon,
  BarChart: StatsIcon,
  Flag: GoalsIcon,
  Group: GroupIcon,
  Settings: SettingsIcon,
  AutoAwesome: AutoAwesomeIcon,
};

/**
 * Main application layout with responsive sidebar navigation.
 * - Permanent drawer on desktop
 * - Temporary drawer on mobile
 * - Top bar with page title and theme toggle
 */
export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();
  const { user, logout } = useAuth();

  const [notification, setNotification] = useState(null);

  useWebSocket("/user/queue/notifications", (msg) => {
    setNotification(msg);
  });

  const handleCloseNotification = (event, reason) => {
    if (reason === "clickaway") return;
    setNotification(null);
  };

  const getInitials = () => {
    const name = user?.displayName || user?.username || "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const currentItem =
    NAV_ITEMS.find((item) => item.path === location.pathname) ||
    (location.pathname.startsWith("/settings") ? { label: "Settings" } : null) ||
    (location.pathname.startsWith("/groups") || location.pathname.startsWith("/messages")
      ? { label: "Community" }
      : null);

  const xpPercent = Math.min(100, ((user?.currentXp || 0) / (user?.nextLevelXp || 100)) * 100);

  const themeToggle = (
    <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton onClick={toggleTheme} size="small" sx={{ color: "text.secondary", border: 1, borderColor: "divider", width: 34, height: 34 }}>
        {mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Brand */}
      <Box sx={{ px: 2.5, height: 64, display: "flex", alignItems: "center", flexShrink: 0 }}>
        <BrandLogo size={30} />
      </Box>

      {/* Navigation Items */}
      <List component="nav" sx={{ flex: 1, px: 1.5, pt: 1, pb: 2, overflowY: "auto" }}>
        {Object.entries(
          NAV_ITEMS.reduce((acc, item) => {
            if (!acc[item.section]) acc[item.section] = [];
            acc[item.section].push(item);
            return acc;
          }, {})
        ).map(([section, items]) => (
          <Box key={section} sx={{ mb: 2 }}>
            <Typography
              sx={{
                px: 1.5,
                mb: 0.75,
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "text.secondary",
                opacity: 0.75,
              }}
            >
              {section}
            </Typography>
            {items.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = location.pathname === item.path;

              return (
                <ListItemButton
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  selected={isActive}
                  sx={{
                    mb: 0.25,
                    py: 0.85,
                    px: 1.5,
                    color: isActive ? "text.primary" : "text.secondary",
                    "&.Mui-selected": {
                      bgcolor: "action.selected",
                      "&:hover": { bgcolor: "action.selected" },
                    },
                    "&:hover": { color: "text.primary" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: isActive ? "primary.main" : "inherit" }}>
                    <Icon sx={{ fontSize: 19 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: { sx: { fontSize: "0.875rem", fontWeight: isActive ? 600 : 500 } },
                    }}
                  />
                </ListItemButton>
              );
            })}
          </Box>
        ))}
      </List>

      {/* Profile */}
      <Box sx={{ p: 1.5, borderTop: 1, borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, p: 1, borderRadius: 2 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", color: "#fff", fontSize: "0.8rem" }}>
            {getInitials()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.displayName || user?.username || "Champ"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: "0.7rem" }}>
                Lvl {user?.level || 1}
              </Typography>
              <LinearProgress variant="determinate" value={xpPercent} sx={{ flex: 1, height: 4 }} />
            </Box>
          </Box>
          <Tooltip title="Settings">
            <IconButton size="small" onClick={() => handleNavClick("/settings")} sx={{ color: "text.secondary" }}>
              <SettingsIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Log out">
            <IconButton size="small" onClick={logout} sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}>
              <LogoutIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  const drawerPaperSx = {
    "& .MuiDrawer-paper": {
      width: DRAWER_WIDTH,
      bgcolor: "background.paper",
      borderRight: 1,
      borderColor: "divider",
    },
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* App Bar — mobile only */}
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: "background.paper",
            color: "text.primary",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton edge="start" onClick={handleDrawerToggle} aria-label="Open navigation" sx={{ color: "text.primary" }}>
              <MenuIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <BrandLogo size={28} />
            </Box>
            {themeToggle}
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar Drawer */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={drawerPaperSx}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer variant="permanent" sx={drawerPaperSx} open>
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        {/* Desktop top bar */}
        {!isMobile && (
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: theme.zIndex.appBar,
              height: 64,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 4,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: mode === "dark" ? "rgba(9, 9, 11, 0.8)" : "rgba(247, 247, 248, 0.8)",
              backdropFilter: "saturate(180%) blur(8px)",
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              Level Up AI
              {currentItem && (
                <>
                  <Box component="span" sx={{ mx: 1, opacity: 0.5 }}>/</Box>
                  <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
                    {currentItem.label}
                  </Box>
                </>
              )}
            </Typography>
            {themeToggle}
          </Box>
        )}

        {/* Page Content */}
        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 3, md: 4 },
            mt: isMobile ? "56px" : 0,
            maxWidth: 1320,
            mx: "auto",
            width: "100%",
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Global Notifications */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseNotification} severity="info" sx={{ width: "100%" }} variant="filled">
          {notification?.message || "New notification"}
        </Alert>
      </Snackbar>
    </Box>
  );
}
