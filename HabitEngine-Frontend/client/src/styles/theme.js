import { createTheme } from "@mui/material/styles";

/**
 * HabitEngine MUI Theme
 *
 * Design system with dark mode as default.
 * Uses a rich, modern color palette with purple accents.
 */

const sharedTypography = {
  fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
  h1: {
    fontSize: "2.25rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  h2: {
    fontSize: "1.75rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    lineHeight: 1.3,
  },
  h3: {
    fontSize: "1.5rem",
    fontWeight: 600,
    lineHeight: 1.35,
  },
  h4: {
    fontSize: "1.25rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: "1.1rem",
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: "1rem",
    fontWeight: 500,
    lineHeight: 1.4,
  },
  body1: {
    fontSize: "0.9375rem",
    lineHeight: 1.6,
  },
  body2: {
    fontSize: "0.875rem",
    lineHeight: 1.5,
  },
  button: {
    textTransform: "none",
    fontWeight: 600,
  },
};

const sharedComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        padding: "8px 20px",
        fontSize: "0.875rem",
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        transition: "box-shadow 0.3s ease, transform 0.2s ease",
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
    },
  },
};

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#8B5CF6",
      light: "#A78BFA",
      dark: "#7C3AED",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#06B6D4",
      light: "#22D3EE",
      dark: "#0891B2",
    },
    success: {
      main: "#10B981",
      light: "#34D399",
      dark: "#059669",
    },
    warning: {
      main: "#F59E0B",
      light: "#FBBF24",
      dark: "#D97706",
    },
    error: {
      main: "#EF4444",
      light: "#F87171",
      dark: "#DC2626",
    },
    background: {
      default: "#0F0F1A",
      paper: "#1A1A2E",
    },
    text: {
      primary: "#F1F5F9",
      secondary: "#94A3B8",
    },
    divider: "rgba(148, 163, 184, 0.12)",
  },
  typography: sharedTypography,
  shape: {
    borderRadius: 12,
  },
  components: {
    ...sharedComponents,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: "none",
          border: "1px solid rgba(139, 92, 246, 0.08)",
          transition: "box-shadow 0.3s ease, transform 0.2s ease",
          "&:hover": {
            boxShadow: "0 8px 32px rgba(139, 92, 246, 0.15)",
          },
        },
      },
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#7C3AED",
      light: "#8B5CF6",
      dark: "#6D28D9",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#0891B2",
      light: "#06B6D4",
      dark: "#0E7490",
    },
    success: {
      main: "#059669",
      light: "#10B981",
      dark: "#047857",
    },
    warning: {
      main: "#D97706",
      light: "#F59E0B",
      dark: "#B45309",
    },
    error: {
      main: "#DC2626",
      light: "#EF4444",
      dark: "#B91C1C",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1E293B",
      secondary: "#64748B",
    },
    divider: "rgba(30, 41, 59, 0.08)",
  },
  typography: sharedTypography,
  shape: {
    borderRadius: 12,
  },
  components: {
    ...sharedComponents,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(0, 0, 0, 0.06)",
          transition: "box-shadow 0.3s ease, transform 0.2s ease",
          "&:hover": {
            boxShadow: "0 8px 32px rgba(124, 58, 237, 0.1)",
          },
        },
      },
    },
  },
});
