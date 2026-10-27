import { Box, Typography, Fade } from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import BrandLogo from "../common/BrandLogo";

const highlights = [
  {
    icon: AutoAwesomeOutlinedIcon,
    title: "AI goal planning",
    text: "Turn a goal into milestones, habits and a daily schedule in seconds.",
  },
  {
    icon: EventRepeatOutlinedIcon,
    title: "Routines that stick",
    text: "Time-blocked routines and habit check-ins keep you consistent.",
  },
  {
    icon: InsightsOutlinedIcon,
    title: "Progress you can see",
    text: "Streaks, trends and XP show exactly how far you've come.",
  },
];

/**
 * Split-screen layout for the sign-in / sign-up pages.
 * Left: brand panel (hidden on small screens). Right: the form passed as children.
 */
export default function AuthLayout({ title, subtitle, children, onSubmit }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "background.default" }}>
      {/* Brand panel */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          width: "46%",
          maxWidth: 640,
          p: 6,
          position: "relative",
          overflow: "hidden",
          color: "#fff",
          background: "linear-gradient(160deg, #1E1B4B 0%, #312E81 55%, #4338CA 100%)",
        }}
      >
        {/* Fine grid texture */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.12,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at 30% 20%, #000 0%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at 30% 20%, #000 0%, transparent 70%)",
          }}
        />
        <Box sx={{ position: "relative" }}>
          <BrandLogo size={36} color="#fff" showTagline />
        </Box>

        <Box sx={{ position: "relative", maxWidth: 440 }}>
          <Typography
            sx={{ fontSize: "2.25rem", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, mb: 2 }}
          >
            Plan smarter.
            <br />
            Grow every day.
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.72)", mb: 5, fontSize: "0.975rem" }}>
            Goals, habits and routines in one place, with an AI planner that keeps you on track.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {highlights.map(({ icon: Icon, title: t, text }) => (
              <Box key={t} sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                >
                  <Icon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>{t}</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.825rem" }}>{text}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Typography sx={{ position: "relative", color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
          © {new Date().getFullYear()} Level Up AI
        </Typography>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2.5, sm: 4 },
          py: 6,
        }}
      >
        <Fade in timeout={400}>
          <Box component="form" onSubmit={onSubmit} sx={{ width: "100%", maxWidth: 400 }}>
            <Box sx={{ display: { xs: "flex", md: "none" }, mb: 5 }}>
              <BrandLogo size={32} />
            </Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              {subtitle}
            </Typography>
            {children}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}
