import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SecurityIcon from "@mui/icons-material/Security";
import PaletteIcon from "@mui/icons-material/Palette";
import LogoutIcon from "@mui/icons-material/Logout";
import SaveIcon from "@mui/icons-material/Save";
import { useAuth } from "../contexts/AuthContext";
import { useThemeMode } from "../contexts/ThemeContext";
import profileApi from "../api/profileApi";
import notificationApi from "../api/notificationApi";

function TabPanel({ children, value, index }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  );
}

/**
 * Full-featured Settings page.
 * Tabs: Profile, Notifications, Appearance, Account
 */
export default function SettingsPage() {
  const theme = useTheme();
  const { user, updateUser, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Profile state
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Notifications state
  const [notifPrefs, setNotifPrefs] = useState({
    reminderEnabled: false,
    reminderTime: "08:00",
    emailFrequency: "NEVER",
  });
  const [loadingNotif, setLoadingNotif] = useState(true);
  const [savingNotif, setSavingNotif] = useState(false);

  useEffect(() => {
    // Load notification preferences
    notificationApi
      .getPreferences()
      .then((res) => {
        if (res.success) {
          const data = res.data;
          setNotifPrefs({
            reminderEnabled: data.reminderEnabled ?? false,
            reminderTime: data.reminderTime
              ? `${String(data.reminderTime[0]).padStart(2, "0")}:${String(data.reminderTime[1]).padStart(2, "0")}`
              : "08:00",
            emailFrequency: data.emailFrequency ?? "NEVER",
          });
        }
      })
      .catch((err) => console.error("Failed to load notification prefs", err))
      .finally(() => setLoadingNotif(false));
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await profileApi.updateProfile({ displayName });
      if (res.success) {
        updateUser({ displayName });
        showSnackbar("Profile updated successfully!");
      }
    } catch (err) {
      showSnackbar(err.message || "Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSavingNotif(true);
    try {
      const [hours, minutes] = notifPrefs.reminderTime.split(":");
      const res = await notificationApi.updatePreferences({
        reminderEnabled: notifPrefs.reminderEnabled,
        reminderTime: [parseInt(hours), parseInt(minutes)],
        emailFrequency: notifPrefs.emailFrequency,
      });
      if (res.success) {
        showSnackbar("Notification preferences saved!");
      }
    } catch (err) {
      showSnackbar(err.message || "Failed to save notification preferences", "error");
    } finally {
      setSavingNotif(false);
    }
  };

  const getInitials = () => {
    const name = user?.displayName || user?.username || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sectionCard = (children) => (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        overflow: "visible",
      }}
    >
      <CardContent sx={{ p: 3 }}>{children}</CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ mb: 0.5 }}>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your profile, notifications, and app preferences
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 0 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 500 },
            "& .Mui-selected": { color: "primary.main" },
          }}
        >
          <Tab icon={<PersonIcon />} iconPosition="start" label="Profile" />
          <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notifications" />
          <Tab icon={<PaletteIcon />} iconPosition="start" label="Appearance" />
          <Tab icon={<SecurityIcon />} iconPosition="start" label="Account" />
        </Tabs>
      </Box>

      {/* Profile Tab */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 600 }}>
          {sectionCard(
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Your Profile
              </Typography>

              {/* Avatar */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    fontSize: "1.6rem",
                    fontWeight: "bold",
                    background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                  }}
                >
                  {getInitials()}
                </Avatar>
                <Box>
                  <Typography fontWeight="bold">{user?.displayName || user?.username}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Level {user?.level || 1} • {user?.currentXp || 0} XP
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  fullWidth
                  variant="outlined"
                  helperText="This is how your name appears in the app"
                />
                <TextField
                  label="Username"
                  value={user?.username || ""}
                  fullWidth
                  variant="outlined"
                  disabled
                  helperText="Username cannot be changed"
                />
                <TextField
                  label="Email"
                  value={user?.email || ""}
                  fullWidth
                  variant="outlined"
                  disabled
                  helperText="Email cannot be changed"
                />
              </Box>
            </Box>
          )}

          <Button
            variant="contained"
            startIcon={savingProfile ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={handleSaveProfile}
            disabled={savingProfile}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.2,
              background: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
              alignSelf: "flex-start",
              "&:hover": { background: "linear-gradient(135deg, #7C3AED, #6D28D9)" },
            }}
          >
            {savingProfile ? "Saving..." : "Save Profile"}
          </Button>
        </Box>
      </TabPanel>

      {/* Notifications Tab */}
      <TabPanel value={activeTab} index={1}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 600 }}>
          {loadingNotif ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            sectionCard(
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  Reminder Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Set up daily reminders to help you stay on track with your habits.
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notifPrefs.reminderEnabled}
                        onChange={(e) =>
                          setNotifPrefs((p) => ({ ...p, reminderEnabled: e.target.checked }))
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography fontWeight={500}>Enable Daily Reminders</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Receive an email reminder to complete your habits
                        </Typography>
                      </Box>
                    }
                  />

                  <TextField
                    label="Reminder Time"
                    type="time"
                    value={notifPrefs.reminderTime}
                    onChange={(e) =>
                      setNotifPrefs((p) => ({ ...p, reminderTime: e.target.value }))
                    }
                    fullWidth
                    disabled={!notifPrefs.reminderEnabled}
                    InputLabelProps={{ shrink: true }}
                    helperText="Time for your daily reminder email (server time)"
                  />

                  <FormControl fullWidth disabled={!notifPrefs.reminderEnabled}>
                    <InputLabel>Email Frequency</InputLabel>
                    <Select
                      value={notifPrefs.emailFrequency}
                      label="Email Frequency"
                      onChange={(e) =>
                        setNotifPrefs((p) => ({ ...p, emailFrequency: e.target.value }))
                      }
                    >
                      <MenuItem value="DAILY">Daily</MenuItem>
                      <MenuItem value="WEEKLY">Weekly Summary</MenuItem>
                      <MenuItem value="NEVER">Never</MenuItem>
                    </Select>
                  </FormControl>

                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Email reminders require SMTP configuration on the server. Contact your admin to
                    enable this feature.
                  </Alert>
                </Box>
              </Box>
            )
          )}

          <Button
            variant="contained"
            startIcon={savingNotif ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={handleSaveNotifications}
            disabled={savingNotif || loadingNotif}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.2,
              background: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
              alignSelf: "flex-start",
              "&:hover": { background: "linear-gradient(135deg, #7C3AED, #6D28D9)" },
            }}
          >
            {savingNotif ? "Saving..." : "Save Notifications"}
          </Button>
        </Box>
      </TabPanel>

      {/* Appearance Tab */}
      <TabPanel value={activeTab} index={2}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 600 }}>
          {sectionCard(
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Theme
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                {["dark", "light"].map((m) => (
                  <Box
                    key={m}
                    onClick={() => mode !== m && toggleTheme()}
                    sx={{
                      flex: 1,
                      p: 3,
                      borderRadius: 3,
                      border: "2px solid",
                      borderColor: mode === m ? "primary.main" : "divider",
                      bgcolor: m === "dark" ? "#0F0A1E" : "#F8F9FA",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: "primary.light" },
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: 60,
                        borderRadius: 2,
                        mb: 2,
                        background:
                          m === "dark"
                            ? "linear-gradient(135deg, #1A0B2E, #0F0A1E)"
                            : "linear-gradient(135deg, #ffffff, #e8e8e8)",
                        border: "1px solid",
                        borderColor: m === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                      }}
                    />
                    <Typography
                      variant="body2"
                      fontWeight={mode === m ? 700 : 400}
                      sx={{ color: mode === m ? "primary.main" : "text.secondary", textAlign: "center" }}
                    >
                      {m === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
                      {mode === m && " (Active)"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </TabPanel>

      {/* Account Tab */}
      <TabPanel value={activeTab} index={3}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 600 }}>
          {sectionCard(
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                Session
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You are signed in as <strong>{user?.email}</strong>
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={logout}
                sx={{ borderRadius: 2 }}
              >
                Sign Out
              </Button>
            </Box>
          )}

          {sectionCard(
            <Box>
              <Typography variant="h6" fontWeight="bold" color="error.main" sx={{ mb: 1 }}>
                Danger Zone
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Irreversible account actions. These cannot be undone.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                disabled
                sx={{ borderRadius: 2 }}
              >
                Delete Account (Coming Soon)
              </Button>
            </Box>
          )}
        </Box>
      </TabPanel>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
