import { Box, Typography } from "@mui/material";
import { brand } from "../../styles/theme";

/**
 * Level Up AI logo mark + wordmark.
 * The mark is an upward chevron stack inside a rounded tile.
 */
export function LogoMark({ size = 32 }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: size * 0.28 + "px",
        background: brand.gradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
      }}
    >
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 14.5 12 8l7 6.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 20 12 13.5 19 20" stroke="#fff" strokeOpacity="0.55" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="3.6" r="1.6" fill="#fff" />
      </svg>
    </Box>
  );
}

export default function BrandLogo({ size = 32, showTagline = false, color }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
      <LogoMark size={size} />
      <Box sx={{ lineHeight: 1 }}>
        <Typography
          component="span"
          sx={{
            display: "block",
            fontWeight: 700,
            fontSize: size >= 36 ? "1.125rem" : "0.975rem",
            letterSpacing: "-0.02em",
            color: color || "text.primary",
            lineHeight: 1.2,
          }}
        >
          Level Up{" "}
          <Box component="span" sx={{ color: color ? "inherit" : "primary.main" }}>
            AI
          </Box>
        </Typography>
        {showTagline && (
          <Typography
            component="span"
            sx={{ display: "block", fontSize: "0.7rem", color: color ? "rgba(255,255,255,0.7)" : "text.secondary", mt: 0.25 }}
          >
            AI-powered life planner
          </Typography>
        )}
      </Box>
    </Box>
  );
}
