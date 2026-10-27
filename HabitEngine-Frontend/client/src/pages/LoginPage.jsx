import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  InputAdornment,
  IconButton,
  Fade,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

// ─── Animated background orbs ───────────────────────────────────────────
const floatingOrb = {
  position: "absolute",
  borderRadius: "50%",
  filter: "blur(80px)",
  opacity: 0.45,
  animation: "floatOrb 8s ease-in-out infinite",
  "@keyframes floatOrb": {
    "0%, 100%": { transform: "translate(0, 0) scale(1)" },
    "33%": { transform: "translate(30px, -40px) scale(1.1)" },
    "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
  },
};

/**
 * Premium login page with glassmorphism design.
 */
export default function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: isDark
          ? "linear-gradient(135deg, #0F0A1E 0%, #1A0B2E 50%, #0F0A1E 100%)"
          : "linear-gradient(135deg, #F0ECFF 0%, #E8F4FD 50%, #F0ECFF 100%)",
      }}
    >
      {/* Animated floating orbs */}
      <Box
        sx={{
          ...floatingOrb,
          width: 340,
          height: 340,
          top: "-8%",
          left: "-5%",
          background: "radial-gradient(circle, #8B5CF6, transparent 70%)",
        }}
      />
      <Box
        sx={{
          ...floatingOrb,
          width: 280,
          height: 280,
          bottom: "-5%",
          right: "-3%",
          background: "radial-gradient(circle, #06B6D4, transparent 70%)",
          animationDelay: "2s",
          animationDuration: "10s",
        }}
      />
      <Box
        sx={{
          ...floatingOrb,
          width: 200,
          height: 200,
          top: "50%",
          right: "15%",
          background: "radial-gradient(circle, #8B5CF6, transparent 70%)",
          opacity: 0.25,
          animationDelay: "4s",
          animationDuration: "12s",
        }}
      />

      {/* Glassmorphism card */}
      <Fade in timeout={800}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: 440,
            mx: 2,
            px: { xs: 3, sm: 5 },
            py: { xs: 4, sm: 5 },
            borderRadius: 4,
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            background: isDark
              ? "rgba(26, 26, 46, 0.65)"
              : "rgba(255, 255, 255, 0.70)",
            border: `1px solid ${
              isDark ? "rgba(139, 92, 246, 0.18)" : "rgba(139, 92, 246, 0.15)"
            }`,
            boxShadow: isDark
              ? "0 24px 80px rgba(0, 0, 0, 0.55), 0 0 40px rgba(139, 92, 246, 0.08)"
              : "0 24px 80px rgba(0, 0, 0, 0.08), 0 0 40px rgba(139, 92, 246, 0.06)",
          }}
        >
          {/* Logo / Brand */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: 3,
                background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                mb: 2,
                boxShadow: "0 8px 24px rgba(139, 92, 246, 0.35)",
              }}
            >
              <RocketLaunchIcon sx={{ fontSize: 32, color: "#fff" }} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                mb: 0.5,
              }}
            >
              Level Up AI
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue your quest
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Fade in>
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  bgcolor: isDark ? "rgba(239, 68, 68, 0.12)" : undefined,
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {/* Email Field */}
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon
                      sx={{ color: "text.secondary", fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                transition: "all 0.2s ease",
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 3px ${
                    isDark
                      ? "rgba(139, 92, 246, 0.15)"
                      : "rgba(139, 92, 246, 0.10)"
                  }`,
                },
              },
            }}
          />

          {/* Password Field */}
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon
                      sx={{ color: "text.secondary", fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: "text.secondary" }}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              mb: 3.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                transition: "all 0.2s ease",
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 3px ${
                    isDark
                      ? "rgba(139, 92, 246, 0.15)"
                      : "rgba(139, 92, 246, 0.10)"
                  }`,
                },
              },
            }}
          />

          {/* Sign In Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 2.5,
              fontSize: "1rem",
              fontWeight: 600,
              background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
              boxShadow: "0 4px 20px rgba(139, 92, 246, 0.35)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #7C3AED, #0891B2)",
                boxShadow: "0 6px 28px rgba(139, 92, 246, 0.45)",
                transform: "translateY(-1px)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
              "&.Mui-disabled": {
                background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                opacity: 0.7,
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Register Link */}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{" "}
              <Link
                component={RouterLink}
                to="/register"
                underline="none"
                sx={{
                  fontWeight: 600,
                  background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  transition: "opacity 0.2s ease",
                  "&:hover": { opacity: 0.8 },
                }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
}
