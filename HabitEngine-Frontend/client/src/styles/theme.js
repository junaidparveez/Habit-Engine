import { alpha, createTheme } from "@mui/material/styles";

/**
 * Level Up AI MUI Theme
 *
 * Neutral zinc surfaces with a single indigo accent.
 * Flat, bordered surfaces and restrained shadows for a calm, professional look.
 */

// Brand tokens shared by components that need raw colour values (charts, icons, etc.)
export const brand = {
  primary: "#6366F1",
  primaryDark: "#4F46E5",
  secondary: "#0EA5E9",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  // Subtle tonal gradient — reserved for the logo mark and a few hero surfaces
  gradient: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
};

const tokens = {
  dark: {
    bg: "#09090B",
    paper: "#111113",
    subtle: "#18181B",
    border: "rgba(255, 255, 255, 0.08)",
    borderStrong: "rgba(255, 255, 255, 0.14)",
    text: "#FAFAFA",
    textMuted: "#A1A1AA",
    primary: { main: "#818CF8", light: "#A5B4FC", dark: "#6366F1" },
  },
  light: {
    bg: "#F7F7F8",
    paper: "#FFFFFF",
    subtle: "#F4F4F5",
    border: "#E4E4E7",
    borderStrong: "#D4D4D8",
    text: "#18181B",
    textMuted: "#71717A",
    primary: { main: "#4F46E5", light: "#6366F1", dark: "#4338CA" },
  },
};

const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  h1: { fontSize: "2.25rem", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15 },
  h2: { fontSize: "1.875rem", fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.2 },
  h3: { fontSize: "1.5rem", fontWeight: 650, letterSpacing: "-0.02em", lineHeight: 1.3 },
  h4: { fontSize: "1.5rem", fontWeight: 650, letterSpacing: "-0.02em", lineHeight: 1.3 },
  h5: { fontSize: "1.125rem", fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.4 },
  h6: { fontSize: "1rem", fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.4 },
  subtitle1: { fontSize: "0.9375rem", fontWeight: 600 },
  subtitle2: { fontSize: "0.8125rem", fontWeight: 600 },
  body1: { fontSize: "0.9375rem", lineHeight: 1.6 },
  body2: { fontSize: "0.875rem", lineHeight: 1.55 },
  caption: { fontSize: "0.75rem", lineHeight: 1.5 },
  overline: { fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", lineHeight: 1.5 },
  button: { textTransform: "none", fontWeight: 600, letterSpacing: "-0.005em" },
};

function buildTheme(mode) {
  const t = tokens[mode];
  const isDark = mode === "dark";
  const focusRing = `0 0 0 3px ${alpha(t.primary.main, isDark ? 0.25 : 0.18)}`;
  const cardShadow = isDark
    ? "none"
    : "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.03)";
  const popShadow = isDark
    ? "0 16px 48px rgba(0, 0, 0, 0.6)"
    : "0 12px 32px rgba(16, 24, 40, 0.12), 0 2px 6px rgba(16, 24, 40, 0.06)";

  return createTheme({
    palette: {
      mode,
      primary: { ...t.primary, contrastText: "#FFFFFF" },
      secondary: { main: "#0EA5E9", light: "#38BDF8", dark: "#0284C7", contrastText: "#FFFFFF" },
      success: { main: "#10B981", light: "#34D399", dark: "#059669" },
      warning: { main: "#F59E0B", light: "#FBBF24", dark: "#D97706" },
      error: { main: "#EF4444", light: "#F87171", dark: "#DC2626" },
      info: { main: "#0EA5E9", light: "#38BDF8", dark: "#0284C7" },
      background: { default: t.bg, paper: t.paper },
      text: { primary: t.text, secondary: t.textMuted },
      divider: t.border,
      action: {
        hover: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(24, 24, 27, 0.04)",
        selected: alpha(t.primary.main, isDark ? 0.14 : 0.08),
      },
    },
    typography,
    // Base unit of 4px so `borderRadius: 2 | 3` in sx resolves to 8px / 12px
    shape: { borderRadius: 4 },
    custom: t,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: t.bg },
          "::selection": { background: alpha(t.primary.main, 0.25) },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: "none", borderRadius: 12 },
          outlined: { borderColor: t.border },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundImage: "none",
            backgroundColor: t.paper,
            border: `1px solid ${t.border}`,
            boxShadow: cardShadow,
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          },
        },
      },
      MuiCardContent: {
        styleOverrides: { root: { padding: 20, "&:last-child": { paddingBottom: 20 } } },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: "7px 16px",
            fontSize: "0.875rem",
            boxShadow: "none",
            "&:focus-visible": { boxShadow: focusRing },
          },
          sizeSmall: { padding: "4px 12px", fontSize: "0.8125rem" },
          sizeLarge: { padding: "10px 20px", fontSize: "0.9375rem" },
          containedPrimary: {
            backgroundColor: isDark ? "#6366F1" : t.primary.main,
            "&:hover": { backgroundColor: isDark ? "#4F46E5" : t.primary.dark, boxShadow: "none" },
          },
          outlined: {
            borderColor: t.borderStrong,
            color: t.text,
            "&:hover": { borderColor: t.borderStrong, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F4F4F5" },
          },
          outlinedPrimary: {
            borderColor: alpha(t.primary.main, 0.45),
            color: t.primary.main,
            "&:hover": { borderColor: t.primary.main, backgroundColor: alpha(t.primary.main, 0.06) },
          },
          text: { "&:hover": { backgroundColor: alpha(t.primary.main, 0.06) } },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { borderRadius: 8, "&:focus-visible": { boxShadow: focusRing } },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: isDark ? "rgba(255, 255, 255, 0.02)" : "#FFFFFF",
            transition: "box-shadow 0.15s ease, border-color 0.15s ease",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: t.borderStrong },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? "rgba(255,255,255,0.24)" : "#A1A1AA",
            },
            "&.Mui-focused": { boxShadow: focusRing },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: t.primary.main,
              borderWidth: 1,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: { root: { fontSize: "0.875rem" } },
      },
      MuiFormHelperText: {
        styleOverrides: { root: { marginLeft: 2 } },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 6, fontWeight: 500, fontSize: "0.75rem" },
          outlined: { borderColor: t.borderStrong },
          filled: { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#F4F4F5" },
          colorPrimary: { "&.MuiChip-filled": { backgroundColor: alpha(t.primary.main, 0.14), color: t.primary.main } },
          colorSuccess: { "&.MuiChip-filled": { backgroundColor: alpha("#10B981", 0.14), color: isDark ? "#34D399" : "#047857" } },
          colorWarning: { "&.MuiChip-filled": { backgroundColor: alpha("#F59E0B", 0.16), color: isDark ? "#FBBF24" : "#B45309" } },
          colorError: { "&.MuiChip-filled": { backgroundColor: alpha("#EF4444", 0.14), color: isDark ? "#F87171" : "#B91C1C" } },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            border: `1px solid ${t.border}`,
            backgroundColor: t.paper,
            boxShadow: popShadow,
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { fontSize: "1.125rem", fontWeight: 600, letterSpacing: "-0.01em", padding: "20px 24px 12px" } },
      },
      MuiDialogContent: { styleOverrides: { root: { padding: "8px 24px" } } },
      MuiDialogActions: { styleOverrides: { root: { padding: "16px 24px 20px", gap: 8 } } },
      MuiBackdrop: {
        styleOverrides: {
          root: { "&:not(.MuiBackdrop-invisible)": { backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(24,24,27,0.35)", backdropFilter: "blur(2px)" } },
        },
      },
      MuiMenu: {
        styleOverrides: { paper: { border: `1px solid ${t.border}`, boxShadow: popShadow, marginTop: 4 } },
      },
      MuiPopover: {
        styleOverrides: { paper: { border: `1px solid ${t.border}`, boxShadow: popShadow } },
      },
      MuiMenuItem: {
        styleOverrides: { root: { fontSize: "0.875rem", borderRadius: 6, margin: "2px 6px", minHeight: 36 } },
      },
      MuiTooltip: {
        defaultProps: { arrow: false },
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? "#27272A" : "#18181B",
            color: "#FAFAFA",
            fontSize: "0.75rem",
            fontWeight: 500,
            padding: "6px 10px",
            borderRadius: 6,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { height: 6, borderRadius: 999, backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#E4E4E7" },
          bar: { borderRadius: 999 },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 40, borderBottom: `1px solid ${t.border}` },
          indicator: { height: 2, borderRadius: 2 },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 40,
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.875rem",
            color: t.textMuted,
            "&.Mui-selected": { color: t.text, fontWeight: 600 },
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F4F4F5",
            padding: 3,
            borderRadius: 8,
            gap: 2,
            "& .MuiToggleButtonGroup-grouped": { border: 0, borderRadius: "6px !important", margin: 0 },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.8125rem",
            padding: "4px 12px",
            color: t.textMuted,
            "&.Mui-selected": {
              color: t.text,
              backgroundColor: isDark ? "#27272A" : "#FFFFFF",
              boxShadow: isDark ? "none" : "0 1px 2px rgba(16,24,40,0.08)",
              "&:hover": { backgroundColor: isDark ? "#27272A" : "#FFFFFF" },
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 10, fontSize: "0.875rem", alignItems: "center" },
          standard: { border: "1px solid" },
          standardError: { borderColor: alpha("#EF4444", 0.3), backgroundColor: alpha("#EF4444", isDark ? 0.1 : 0.06) },
          standardSuccess: { borderColor: alpha("#10B981", 0.3), backgroundColor: alpha("#10B981", isDark ? 0.1 : 0.06) },
          standardWarning: { borderColor: alpha("#F59E0B", 0.3), backgroundColor: alpha("#F59E0B", isDark ? 0.1 : 0.06) },
          standardInfo: { borderColor: alpha("#0EA5E9", 0.3), backgroundColor: alpha("#0EA5E9", isDark ? 0.1 : 0.06) },
        },
      },
      MuiDivider: { styleOverrides: { root: { borderColor: t.border } } },
      MuiAvatar: { styleOverrides: { root: { fontWeight: 600, fontSize: "0.875rem" } } },
      MuiListItemButton: {
        styleOverrides: { root: { borderRadius: 8 } },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: t.border },
          head: { fontWeight: 600, fontSize: "0.75rem", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: { "&.Mui-checked + .MuiSwitch-track": { opacity: 1 } },
          track: { borderRadius: 999, backgroundColor: isDark ? "#3F3F46" : "#D4D4D8", opacity: 1 },
        },
      },
      MuiCheckbox: {
        styleOverrides: { root: { color: t.borderStrong } },
      },
      MuiSkeleton: {
        styleOverrides: { root: { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#EEEEF0" } },
      },
      MuiDrawer: {
        styleOverrides: { paper: { backgroundImage: "none", borderColor: t.border } },
      },
    },
  });
}

export const darkTheme = buildTheme("dark");
export const lightTheme = buildTheme("light");
