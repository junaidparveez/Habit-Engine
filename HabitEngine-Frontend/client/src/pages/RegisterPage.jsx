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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffOutlined";
import AuthLayout from "../components/auth/AuthLayout";

/**
 * Registration page — shares the split-screen AuthLayout with the login page.
 */
export default function RegisterPage() {
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

  const visibilityToggle = (visible, toggle) => ({
    input: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            onClick={toggle}
            edge="end"
            size="small"
            aria-label={visible ? "Hide password" : "Show password"}
            sx={{ color: "text.secondary" }}
          >
            {visible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </IconButton>
        </InputAdornment>
      ),
    },
  });

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start planning your goals with AI in under a minute."
      onSubmit={handleSubmit}
    >
      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
        <TextField
          label="Username"
          fullWidth
          required
          value={formData.username}
          onChange={handleChange("username")}
          autoComplete="username"
          autoFocus
        />
        <TextField
          label="Display name"
          fullWidth
          value={formData.displayName}
          onChange={handleChange("displayName")}
          placeholder="Optional"
        />
      </Box>

      <TextField
        label="Email"
        type="email"
        fullWidth
        required
        value={formData.email}
        onChange={handleChange("email")}
        autoComplete="email"
        sx={{ mb: 2 }}
      />

      <TextField
        label="Password"
        type={showPassword ? "text" : "password"}
        fullWidth
        required
        value={formData.password}
        onChange={handleChange("password")}
        autoComplete="new-password"
        helperText="At least 8 characters"
        slotProps={visibilityToggle(showPassword, () => setShowPassword(!showPassword))}
        sx={{ mb: 2 }}
      />

      <TextField
        label="Confirm password"
        type={showConfirmPassword ? "text" : "password"}
        fullWidth
        required
        value={formData.confirmPassword}
        onChange={handleChange("confirmPassword")}
        autoComplete="new-password"
        slotProps={visibilityToggle(showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}
        sx={{ mb: 3.5 }}
      />

      <Button type="submit" fullWidth size="large" variant="contained" disabled={loading} sx={{ height: 44 }}>
        {loading ? <CircularProgress size={20} sx={{ color: "inherit" }} /> : "Create account"}
      </Button>

      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{" "}
          <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600 }}>
            Sign in
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
}
