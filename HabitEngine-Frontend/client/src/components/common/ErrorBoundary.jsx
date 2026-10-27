import React from "react";
import { Box, Typography, Button } from "@mui/material";
import BugReportIcon from "@mui/icons-material/BugReport";
import RefreshIcon from "@mui/icons-material/Refresh";

/**
 * React Error Boundary — catches unexpected render errors and shows a premium fallback UI.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            px: 4,
            textAlign: "center",
          }}
        >
          <BugReportIcon
            sx={{ fontSize: 64, color: "error.main", mb: 2, opacity: 0.8 }}
          />
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 480 }}>
            An unexpected error occurred. This has been logged and we&apos;ll look into it.
            Try refreshing the page.
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
            sx={{
              borderRadius: 8,
              px: 4,
              background: "linear-gradient(135deg, #6366F1, #4F46E5)",
            }}
          >
            Refresh Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
