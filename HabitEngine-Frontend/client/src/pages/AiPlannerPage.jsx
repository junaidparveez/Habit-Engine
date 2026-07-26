import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Skeleton,
  Grid,
  IconButton,
  Tooltip,
  Fade,
  LinearProgress,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import FlagIcon from "@mui/icons-material/Flag";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SaveIcon from "@mui/icons-material/Save";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LinkIcon from "@mui/icons-material/Link";
import NoteIcon from "@mui/icons-material/Note";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import aiApi from "../api/aiApi";

// ─── Category colors for routine blocks ──────────────────────────────────────
const CATEGORY_META = {
  MORNING: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "Morning" },
  STUDY:   { color: "#6366F1", bg: "rgba(99,102,241,0.12)",  label: "Study"   },
  WORK:    { color: "#3B82F6", bg: "rgba(59,130,246,0.12)",  label: "Work"    },
  HEALTH:  { color: "#10B981", bg: "rgba(16,185,129,0.12)",  label: "Health"  },
  EVENING: { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)",  label: "Evening" },
};

const RESOURCE_META = {
  YOUTUBE: { color: "#EF4444", icon: <YouTubeIcon sx={{ fontSize: 16 }} />, label: "YouTube" },
  URL:     { color: "#3B82F6", icon: <LinkIcon sx={{ fontSize: 16 }} />,    label: "URL"     },
  NOTE:    { color: "#8B5CF6", icon: <NoteIcon sx={{ fontSize: 16 }} />,    label: "Note"    },
};

// ─── Inline editable text field component ────────────────────────────────────
function InlineEdit({ value, onChange, multiline = false, variant = "body2" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    onChange(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
        <TextField
          size="small"
          fullWidth
          multiline={multiline}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          sx={{ "& .MuiInputBase-input": { fontSize: "0.875rem", py: 0.5 } }}
        />
        <Tooltip title="Save">
          <IconButton size="small" onClick={commit} sx={{ color: "primary.main", mt: 0.2 }}>
            <CheckIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer", "&:hover .edit-icon": { opacity: 1 } }}
      onClick={() => setEditing(true)}
    >
      <Typography variant={variant} sx={{ flex: 1, lineHeight: 1.5 }}>
        {value}
      </Typography>
      <EditIcon className="edit-icon" sx={{ fontSize: 14, opacity: 0, color: "text.secondary", transition: "opacity 0.2s", flexShrink: 0 }} />
    </Box>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function PlanSkeleton() {
  return (
    <Box sx={{ mt: 4 }}>
      {[...Array(4)].map((_, i) => (
        <Card key={i} sx={{ mb: 2, borderRadius: 3 }}>
          <CardContent>
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} variant="rounded" width={80} height={24} />
              ))}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AiPlannerPage() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ── Generate ─────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!description.trim() || description.trim().length < 10) {
      setError("Please describe your plan in at least 10 characters.");
      return;
    }
    setError("");
    setPlan(null);
    setLoading(true);
    try {
      const res = await aiApi.generatePlan(description.trim());
      setPlan(res.data);
    } catch (err) {
      setError(err.message || "AI generation failed. Make sure the backend is running with a valid OpenAI API key.");
    } finally {
      setLoading(false);
    }
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!plan) return;
    setSaving(true);
    try {
      await aiApi.savePlan(plan);
      setSuccessMsg("🎉 Plan saved! Your goal, milestones, and routine are ready.");
      setTimeout(() => navigate("/goals"), 2000);
    } catch (err) {
      setError(err.message || "Failed to save plan. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Patch helpers ─────────────────────────────────────────────────────────
  const patchGoal = (field, value) =>
    setPlan((p) => ({ ...p, goal: { ...p.goal, [field]: value } }));

  const patchMilestone = (idx, field, value) =>
    setPlan((p) => {
      const milestones = [...p.milestones];
      milestones[idx] = { ...milestones[idx], [field]: value };
      return { ...p, milestones };
    });

  const patchResource = (idx, field, value) =>
    setPlan((p) => {
      const studySources = [...p.studySources];
      studySources[idx] = { ...studySources[idx], [field]: value };
      return { ...p, studySources };
    });

  const patchRoutine = (idx, field, value) =>
    setPlan((p) => {
      const routineBlocks = [...p.routineBlocks];
      routineBlocks[idx] = { ...routineBlocks[idx], [field]: value };
      return { ...p, routineBlocks };
    });

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>

      {/* ── Header ── */}
      <Box sx={{ mb: 5, textAlign: "center" }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: 4,
            background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
            mb: 2,
            boxShadow: "0 8px 32px rgba(139,92,246,0.4)",
            animation: "pulse 2.5s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { boxShadow: "0 8px 32px rgba(139,92,246,0.4)" },
              "50%": { boxShadow: "0 8px 48px rgba(139,92,246,0.7)" },
            },
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 34, color: "#fff" }} />
        </Box>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            mb: 1,
          }}
        >
          AI Planner
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mx: "auto" }}>
          Describe what you want to achieve — the AI will generate a complete plan with goals, milestones, study resources, and a daily routine. Edit anything before saving.
        </Typography>
      </Box>

      {/* ── Prompt Area ── */}
      <Card
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          background: "linear-gradient(135deg, rgba(139,92,246,0.05), rgba(6,182,212,0.05))",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            ✍️ Describe your plan
          </Typography>
          <TextField
            multiline
            minRows={4}
            maxRows={10}
            fullWidth
            placeholder={`Examples:\n• "I want to learn full-stack development with React and Spring Boot in 4 months, 2 hours daily."\n• "Help me prepare for IELTS exam in 6 weeks with evening study sessions."\n• "I want to build a fitness habit — gym 4x/week, healthy diet, run on weekends."`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            sx={{
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                fontSize: "0.95rem",
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                  boxShadow: "0 0 0 3px rgba(139,92,246,0.15)",
                },
              },
            }}
          />
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {description.length} / 2000 characters
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <AutoAwesomeIcon />}
              onClick={handleGenerate}
              disabled={loading || !description.trim()}
              sx={{
                borderRadius: 2.5,
                fontWeight: 700,
                px: 4,
                background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                "&:hover": { background: "linear-gradient(135deg, #7C3AED, #0891B2)" },
                "&.Mui-disabled": { background: "linear-gradient(135deg, #8B5CF6, #06B6D4)", opacity: 0.6 },
              }}
            >
              {loading ? "Generating Plan…" : "Generate Plan"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ── Loading Skeleton ── */}
      {loading && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <RocketLaunchIcon sx={{ color: "primary.main" }} />
            <Typography variant="body1" fontWeight={600} color="primary.main">
              AI is crafting your personalised plan…
            </Typography>
          </Box>
          <LinearProgress sx={{ borderRadius: 2, mb: 3, "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg, #8B5CF6, #06B6D4)" } }} />
          <PlanSkeleton />
        </Box>
      )}

      {/* ── Generated Plan ── */}
      {!loading && plan && (
        <Fade in>
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
              <Box>
                <Typography variant="h5" fontWeight={800}>
                  ✨ Your AI-Generated Plan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click any text to edit it before saving.
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  borderRadius: 2.5,
                  fontWeight: 700,
                  px: 4,
                  background: "linear-gradient(135deg, #10B981, #06B6D4)",
                  "&:hover": { background: "linear-gradient(135deg, #059669, #0891B2)" },
                  "&.Mui-disabled": { background: "linear-gradient(135deg, #10B981, #06B6D4)", opacity: 0.6 },
                }}
              >
                {saving ? "Saving…" : "Save Plan"}
              </Button>
            </Box>

            {/* Goal Card */}
            <Card sx={{ mb: 3, borderRadius: 3, border: "1px solid", borderColor: "rgba(139,92,246,0.3)", background: "rgba(139,92,246,0.05)" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FlagIcon sx={{ color: "#8B5CF6", fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={700}>Goal</Typography>
                  <Chip label="🎯 Primary Goal" size="small" sx={{ ml: "auto", bgcolor: "rgba(139,92,246,0.12)", color: "#8B5CF6", fontWeight: 600 }} />
                </Box>
                <InlineEdit variant="h6" value={plan.goal.name} onChange={(v) => patchGoal("name", v)} />
                <InlineEdit value={plan.goal.description} onChange={(v) => patchGoal("description", v)} multiline />
                <Box sx={{ mt: 1.5 }}>
                  <Chip
                    label={`🗓 Target: ${plan.goal.targetDate || "Not set"}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 600, borderColor: "rgba(139,92,246,0.4)", color: "#8B5CF6" }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Milestones */}
            <Card sx={{ mb: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CheckCircleOutlineIcon sx={{ color: "#F59E0B", fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={700}>Milestones</Typography>
                  <Chip label={`${plan.milestones.length} checkpoints`} size="small" sx={{ ml: "auto" }} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {plan.milestones.map((m, idx) => (
                    <Box key={idx} sx={{ display: "flex", gap: 2, pb: 2.5 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Box sx={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: "linear-gradient(135deg, #F59E0B, #EF4444)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.75rem", fontWeight: 800, color: "#fff", flexShrink: 0
                        }}>
                          {m.targetWeek}
                        </Box>
                        {idx < plan.milestones.length - 1 && (
                          <Box sx={{ width: 2, flex: 1, bgcolor: "divider", mt: 0.5, minHeight: 16 }} />
                        )}
                      </Box>
                      <Box sx={{ flex: 1, pt: 0.3 }}>
                        <Chip label={`Week ${m.targetWeek}`} size="small" sx={{ mb: 0.5, fontSize: "0.65rem", bgcolor: "rgba(245,158,11,0.1)", color: "#F59E0B", fontWeight: 700 }} />
                        <InlineEdit variant="subtitle2" value={m.title} onChange={(v) => patchMilestone(idx, "title", v)} />
                        <InlineEdit value={m.description} onChange={(v) => patchMilestone(idx, "description", v)} multiline />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Study Sources */}
            <Card sx={{ mb: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "rgba(59,130,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MenuBookIcon sx={{ color: "#3B82F6", fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={700}>Study Sources</Typography>
                  <Chip label={`${plan.studySources.length} resources`} size="small" sx={{ ml: "auto" }} />
                </Box>
                <Grid container spacing={2}>
                  {plan.studySources.map((s, idx) => {
                    const meta = RESOURCE_META[s.resourceType?.toUpperCase()] || RESOURCE_META.NOTE;
                    return (
                      <Grid item xs={12} sm={6} key={idx}>
                        <Box sx={{
                          p: 2, borderRadius: 2,
                          border: "1px solid", borderColor: "divider",
                          bgcolor: "action.hover",
                          transition: "border-color 0.2s",
                          "&:hover": { borderColor: meta.color },
                        }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <Chip
                              icon={meta.icon}
                              label={meta.label}
                              size="small"
                              sx={{ bgcolor: `${meta.color}22`, color: meta.color, fontWeight: 700, fontSize: "0.65rem", "& .MuiChip-icon": { color: meta.color } }}
                            />
                          </Box>
                          <InlineEdit variant="subtitle2" value={s.title} onChange={(v) => patchResource(idx, "title", v)} />
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", mt: 0.3 }}>
                            {s.urlOrContent}
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>

            {/* Routine Blocks */}
            <Card sx={{ mb: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AccessTimeIcon sx={{ color: "#10B981", fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={700}>Daily Routine Blocks</Typography>
                  <Chip label={`${plan.routineBlocks.length} blocks`} size="small" sx={{ ml: "auto" }} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {plan.routineBlocks.map((rb, idx) => {
                    const meta = CATEGORY_META[rb.category?.toUpperCase()] || CATEGORY_META.STUDY;
                    return (
                      <Box key={idx} sx={{
                        display: "flex", gap: 2, p: 2, borderRadius: 2,
                        bgcolor: meta.bg,
                        borderLeft: `4px solid ${meta.color}`,
                        transition: "transform 0.15s",
                        "&:hover": { transform: "translateX(2px)" },
                      }}>
                        <Box sx={{ minWidth: 90, textAlign: "center" }}>
                          <Typography variant="caption" fontWeight={700} sx={{ color: meta.color, display: "block" }}>
                            {typeof rb.startTime === "object"
                              ? `${String(rb.startTime.hour).padStart(2,"0")}:${String(rb.startTime.minute).padStart(2,"0")}`
                              : rb.startTime}
                          </Typography>
                          <Divider sx={{ my: 0.5 }} />
                          <Typography variant="caption" fontWeight={700} sx={{ color: meta.color, display: "block" }}>
                            {typeof rb.endTime === "object"
                              ? `${String(rb.endTime.hour).padStart(2,"0")}:${String(rb.endTime.minute).padStart(2,"0")}`
                              : rb.endTime}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.3 }}>
                            <Chip label={meta.label} size="small" sx={{ bgcolor: `${meta.color}22`, color: meta.color, fontWeight: 700, fontSize: "0.65rem" }} />
                          </Box>
                          <InlineEdit variant="subtitle2" value={rb.title} onChange={(v) => patchRoutine(idx, "title", v)} />
                          <InlineEdit value={rb.description} onChange={(v) => patchRoutine(idx, "description", v)} multiline />
                          {rb.daysOfWeek && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                              Days: {rb.daysOfWeek}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>

            {/* Bottom Save */}
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={saving ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  borderRadius: 3,
                  fontWeight: 700,
                  px: 6,
                  py: 1.5,
                  fontSize: "1rem",
                  background: "linear-gradient(135deg, #10B981, #06B6D4)",
                  boxShadow: "0 4px 20px rgba(16,185,129,0.4)",
                  "&:hover": { background: "linear-gradient(135deg, #059669, #0891B2)", boxShadow: "0 6px 28px rgba(16,185,129,0.5)" },
                  "&.Mui-disabled": { background: "linear-gradient(135deg, #10B981, #06B6D4)", opacity: 0.6 },
                }}
              >
                {saving ? "Saving your plan…" : "💾 Save Plan to LevelUp"}
              </Button>
            </Box>
          </Box>
        </Fade>
      )}

      {/* ── Success Snackbar ── */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={4000}
        onClose={() => setSuccessMsg("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccessMsg("")} sx={{ borderRadius: 2, fontWeight: 600 }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
