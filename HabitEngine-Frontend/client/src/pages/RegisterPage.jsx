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
import PersonIcon from "@mui/icons-material/Person";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
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

// Shared text field styles
const textFieldSx = (theme, isDark) => ({
  mb: 2,
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    transition: "all 0.2s ease",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${
        isDark ? "rgba(139, 92, 246, 0.15)" : "rgba(139, 92, 246, 0.10)"
      }`,
    },
  },
});

/**
 * Premium registration page with glassmorphism design.
 */
export default function RegisterPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isDark = theme.palette.mode === "dark";

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      return "Please fill in all required fields.";
    }
    if (username.length < 3) {
      return "Username must be at least 3 characters.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const { username, email, password, displayName } = formData;
      await register(username, email, password, displayName || username);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = textFieldSx(theme, isDark);

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
          right: "-5%",
          background: "radial-gradient(circle, #06B6D4, transparent 70%)",
        }}
      />
      <Box
        sx={{
          ...floatingOrb,
          width: 280,
          height: 280,
          bottom: "-5%",
          left: "-3%",
          background: "radial-gradient(circle, #8B5CF6, transparent 70%)",
          animationDelay: "2s",
          animationDuration: "10s",
        }}
      />
      <Box
        sx={{
          ...floatingOrb,
          width: 200,
          height: 200,
          top: "35%",
          left: "10%",
          background: "radial-gradient(circle, #06B6D4, transparent 70%)",
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
          <Box sx={{ textAlign: "center", mb: 3.5 }}>
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
              Create your account and begin your quest
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Fade in>
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{
                  mb: 2.5,
                  borderRadius: 2,
                  bgcolor: isDark ? "rgba(239, 68, 68, 0.12)" : undefined,
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          {/* Username */}
          <TextField
            label="Username"
            fullWidth
            required
            value={formData.username}
            onChange={handleChange("username")}
            autoComplete="username"
            autoFocus
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon
                      sx={{ color: "text.secondary", fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
              },
            }}
            sx={fieldSx}
          />

          {/* Email */}
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={formData.email}
            onChange={handleChange("email")}
            autoComplete="email"
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
            sx={fieldSx}
          />

          {/* Display Name */}
          <TextField
            label="Display Name"
            fullWidth
            value={formData.displayName}
            onChange={handleChange("displayName")}
            placeholder="How should we call you?"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeOutlinedIcon
                      sx={{ color: "text.secondary", fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
              },
            }}
            sx={fieldSx}
          />

          {/* Password */}
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            value={formData.password}
            onChange={handleChange("password")}
            autoComplete="new-password"
            helperText="Minimum 8 characters"
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
            sx={fieldSx}
          />

          {/* Confirm Password */}
          <TextField
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            required
            value={formData.confirmPassword}
            onChange={handleChange("confirmPassword")}
            autoComplete="new-password"
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
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                      size="small"
                      sx={{ color: "text.secondary" }}
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ ...fieldSx, mb: 3 }}
          />

          {/* Create Account Button */}
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
              "Create Account"
            )}
          </Button>

          {/* Login Link */}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link
                component={RouterLink}
                to="/login"
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
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
}
