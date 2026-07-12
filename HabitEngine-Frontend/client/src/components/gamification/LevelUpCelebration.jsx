import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, Typography, Box, Button } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

export default function LevelUpCelebration({ open, level, onClose }) {
  useEffect(() => {
    if (open) {
      // Trigger confetti
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#F59E0B', '#8B5CF6', '#06B6D4']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#F59E0B', '#8B5CF6', '#06B6D4']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 2,
          textAlign: "center",
          background: "linear-gradient(135deg, #1A0B2E 0%, #0F0A1E 100%)",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          boxShadow: "0 8px 32px rgba(139, 92, 246, 0.2)",
        }
      }}
    >
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <StarIcon sx={{ fontSize: 80, color: "#F59E0B", filter: "drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))" }} />
        </Box>
        <Typography variant="h4" fontWeight="bold" sx={{ color: "white", mb: 1 }}>
          Level Up!
        </Typography>
        <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
          Congratulations! You've reached Level {level}. Keep up the great work building those habits!
        </Typography>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            borderRadius: 8,
            px: 4,
            py: 1,
            background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Awesome!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
