import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
  Divider,
  Avatar,
  Tooltip,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HabitsIcon from "@mui/icons-material/FitnessCenter";
import StatsIcon from "@mui/icons-material/BarChart";
import GoalsIcon from "@mui/icons-material/Flag";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import GroupIcon from "@mui/icons-material/Group";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import LogoutIcon from "@mui/icons-material/Logout";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { DRAWER_WIDTH, NAV_ITEMS } from "../constants";
import { useThemeMode } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import useWebSocket from "../hooks/useWebSocket";

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
 * - Top app bar with theme toggle
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
    if (reason === 'clickaway') return;
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

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          py: 2.5,
        }}
      >
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 38,
            height: 38,
            fontSize: "1.2rem",
          }}
        >
          <RocketLaunchIcon fontSize="small" />
        </Avatar>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1.1rem",
              background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Level Up AI
          </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontSize: "0.7rem" }}
            >
              Level up your life
            </Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Navigation Items */}
      <List sx={{ flex: 1, px: 1.5, py: 1.5, overflowY: "auto" }}>
        {Object.entries(
          NAV_ITEMS.reduce((acc, item) => {
            if (!acc[item.section]) acc[item.section] = [];
            acc[item.section].push(item);
            return acc;
          }, {})
        ).map(([section, items]) => (
          <Box key={section} sx={{ mb: 2.5 }}>
            <Typography
              variant="overline"
              sx={{
                px: 2,
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "text.secondary",
                opacity: 0.7,
                display: "block",
                mb: 0.5,
              }}
            >
              {section}
            </Typography>
            {items.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = location.pathname === item.path;

              return (
                <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleNavClick(item.path)}
                    sx={{
                      position: "relative",
                      borderRadius: 2,
                      py: 1.2,
                      px: 2,
                      bgcolor: isActive
                        ? "rgba(139, 92, 246, 0.12)"
                        : "transparent",
                      color: isActive ? "primary.main" : "text.secondary",
                      "&:hover": {
                        bgcolor: isActive
                          ? "rgba(139, 92, 246, 0.18)"
                          : "action.hover",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isActive && (
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 4,
                          height: "60%",
                          borderRadius: "0 4px 4px 0",
                          background: "linear-gradient(180deg, #8B5CF6, #06B6D4)",
                        }}
                      />
                    )}
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: isActive ? "primary.main" : "text.secondary",
                      }}
                    >
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isActive ? 700 : 500,
                            fontSize: "0.875rem",
                          }}
                        >
                          {item.label}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </Box>
        ))}
      </List>

      <Divider sx={{ mx: 2 }} />

      <Box sx={{ p: 2, mt: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: "action.hover", border: "1px solid", borderColor: "divider" }}>
          <Avatar sx={{ width: 36, height: 36, background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", fontSize: "1rem", fontWeight: "bold" }}>
            {getInitials()}
          </Avatar>
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {user?.displayName || user?.username || "Champ"}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", fontSize: "0.65rem", fontWeight: 600 }}>
              Level {user?.level || 1} • {user?.currentXp || 0}/{user?.nextLevelXp || 100} XP
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Tooltip title="Settings">
              <IconButton size="small" onClick={() => navigate("/settings")} sx={{ width: 24, height: 24, color: "text.secondary" }}>
                <SettingsIcon sx={{ fontSize: "1.1rem" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton size="small" onClick={logout} sx={{ width: 24, height: 24, color: "error.main" }}>
                <LogoutIcon sx={{ fontSize: "1.1rem" }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* App Bar — mobile only */}
      {isMobile && (
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: "text.primary" }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                flex: 1,
                background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Level Up AI
            </Typography>
            <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
              <IconButton onClick={toggleTheme} sx={{ color: "text.primary" }}>
                {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton onClick={() => navigate("/settings")} sx={{ color: "text.primary" }}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: DRAWER_WIDTH,
                bgcolor: "background.paper",
                borderRight: 1,
                borderColor: "divider",
              },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              "& .MuiDrawer-paper": {
                width: DRAWER_WIDTH,
                bgcolor: "background.paper",
                borderRight: 1,
                borderColor: "divider",
              },
            }}
            open
          >
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
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 1,
              px: 3,
              py: 1.5,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Tooltip title={mode === "dark" ? "Light mode" : "Dark mode"}>
              <IconButton onClick={toggleTheme} sx={{ color: "text.primary" }}>
                {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <IconButton onClick={() => navigate("/settings")} sx={{ color: "text.primary" }}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Page Content */}
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            mt: isMobile ? "64px" : 0,
            maxWidth: 1400,
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
