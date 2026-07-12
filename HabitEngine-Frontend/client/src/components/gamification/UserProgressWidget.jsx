import React, { useEffect, useState } from "react";
import { Box, Typography, LinearProgress, useTheme } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { useAuth } from "../../contexts/AuthContext";

export default function UserProgressWidget() {
  const { user } = useAuth();
  const theme = useTheme();
  
  if (!user) return null;
  
  const level = user.level || 1;
  const currentXp = user.currentXp || 0;
  const nextLevelXp = level * 100;
  const progressPercent = Math.min((currentXp / nextLevelXp) * 100, 100);

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        my: 2,
        mx: 2,
        borderRadius: 3,
        background:
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.03)"
            : "rgba(0,0,0,0.02)",
        border: "1px solid",
        borderColor: "divider",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1, alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <StarIcon sx={{ color: "#F59E0B", fontSize: "1.2rem" }} />
          <Typography variant="body2" fontWeight="bold">
            Level {level}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {currentXp} / {nextLevelXp} XP
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progressPercent}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.05)",
          "& .MuiLinearProgress-bar": {
            borderRadius: 3,
            background: "linear-gradient(90deg, #F59E0B, #FBBF24)",
          },
        }}
      />
    </Box>
  );
}
