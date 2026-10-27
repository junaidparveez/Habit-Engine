import React from "react";
import { Box, Typography, useTheme, Avatar, CircularProgress, IconButton, Tooltip } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function UserProgressWidget() {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();

  if (!user) return null;

  const level = user.level || 1;
  const currentXp = user.currentXp || 0;
  const nextLevelXp = level * 100;
  const progressPercent = Math.min((currentXp / nextLevelXp) * 100, 100);

  const getInitials = () => {
    const name = user?.displayName || user?.username || "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        background:
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.03)"
            : "rgba(0,0,0,0.02)",
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s ease",
        "&:hover": {
          background:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.04)",
        }
      }}
    >
      <Box sx={{ position: "relative", display: "inline-flex", cursor: "pointer" }} onClick={() => navigate("/settings")}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={42}
          thickness={4}
          sx={{
            color: theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
            position: "absolute",
            zIndex: 1,
          }}
        />
        <CircularProgress
          variant="determinate"
          value={progressPercent}
          size={42}
          thickness={4}
          sx={{
            color: "#F59E0B",
            position: "absolute",
            zIndex: 2,
            "& .MuiCircularProgress-circle": {
              strokeLinecap: "round",
            }
          }}
        />
        <Avatar
          sx={{
            width: 34,
            height: 34,
            margin: "4px",
            fontSize: "0.85rem",
            fontWeight: "bold",
            background: "linear-gradient(135deg, #6366F1, #4F46E5)",
            zIndex: 3,
          }}
        >
          {getInitials()}
        </Avatar>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          fontWeight={600}
          noWrap
          sx={{ fontSize: "0.85rem", color: "text.primary" }}
        >
          {user?.displayName || user?.username || "User"}
        </Typography>
        <Typography
          variant="caption"
          noWrap
          sx={{ fontSize: "0.75rem", color: "text.secondary", display: "block" }}
        >
          Level {level} • {currentXp}/{nextLevelXp} XP
        </Typography>
      </Box>

      <Tooltip title="Sign out">
        <IconButton size="small" onClick={logout} sx={{ color: "text.secondary" }}>
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
