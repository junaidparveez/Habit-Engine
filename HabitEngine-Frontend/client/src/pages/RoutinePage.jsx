import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FlagIcon from "@mui/icons-material/Flag";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import routineApi from "../api/routineApi";
import goalApi from "../api/goalApi";

const CATEGORIES = [
  { value: "MORNING", label: "Morning Routine 🌅", color: "#f59e0b" },
  { value: "STUDY", label: "Study / Deep Work 📚", color: "#6366f1" },
  { value: "WORK", label: "Work & Projects 💼", color: "#3b82f6" },
  { value: "HEALTH", label: "Health & Exercise 🏃", color: "#10b981" },
  { value: "EVENING", label: "Evening & Reflection 🌙", color: "#6366F1" },
];

export default function RoutinePage() {
  const [routine, setRoutine] = useState([]);
  const [resources, setResources] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "07:00",
    endTime: "08:30",
    category: "STUDY",
    linkedGoalId: "",
    linkedMilestoneId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [routineRes, resRes, goalsRes] = await Promise.all([
        routineApi.getRoutine(),
        goalApi.getResources(),
        goalApi.getAll(),
      ]);
      const routineList = Array.isArray(routineRes) ? routineRes : (routineRes?.data || []);
      const resourceList = Array.isArray(resRes) ? resRes : (resRes?.data || []);
      const goalList = Array.isArray(goalsRes) ? goalsRes : (goalsRes?.data || []);

      setRoutine(routineList);
      setResources(resourceList);
      setGoals(goalList);
    } catch (err) {
      console.error("Failed to fetch routine data", err);
      setRoutine([]);
      setResources([]);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  // Find milestones for currently selected Goal in dropdown
  const selectedGoal = goals.find((g) => String(g.id) === String(formData.linkedGoalId));
  const availableMilestones = selectedGoal ? (selectedGoal.milestones || []) : [];

  const handleToggle = async (id) => {
    try {
      setRoutine((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, isCompletedToday: !b.isCompletedToday } : b
        )
      );
      await routineApi.toggleBlock(id);
    } catch (err) {
      console.error("Failed to toggle block", err);
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    try {
      await routineApi.deleteBlock(id);
      setRoutine((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Failed to delete block", err);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.startTime || !formData.endTime) return;
    try {
      await routineApi.createBlock({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        startTime: formData.startTime + ":00",
        endTime: formData.endTime + ":00",
        linkedGoalId: formData.linkedGoalId || null,
        linkedMilestoneId: formData.linkedMilestoneId || null,
      });
      setOpenDialog(false);
      setFormData({
        title: "",
        description: "",
        startTime: "07:00",
        endTime: "08:30",
        category: "STUDY",
        linkedGoalId: "",
        linkedMilestoneId: "",
      });
      fetchData();
    } catch (err) {
      console.error("Failed to create block", err);
    }
  };

  const safeRoutine = Array.isArray(routine) ? routine : [];
  const completedCount = safeRoutine.filter((b) => b.isCompletedToday).length;
  const totalCount = safeRoutine.length;
  const disciplineScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getCategoryColor = (cat) => {
    const found = CATEGORIES.find((c) => c.value === cat);
    return found ? found.color : "#6b7280";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccessTimeIcon color="primary" fontSize="large" /> Daily Routine & Execution
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Time-blocked schedule mapped to goal milestones and study resources.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Add Time Block
          </Button>
        </Box>

        {/* Discipline Score Progress */}
        <Box sx={{ mt: 3, p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Today's Discipline Score
            </Typography>
            <Typography variant="h6" fontWeight={800} color={disciplineScore >= 80 ? "success.main" : "primary.main"}>
              {disciplineScore}% ({completedCount}/{totalCount} Completed)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={disciplineScore}
            sx={{ height: 10, borderRadius: 5 }}
            color={disciplineScore >= 80 ? "success" : "primary"}
          />
        </Box>
      </Paper>

      {/* Routine Timeline */}
      {routine.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            borderRadius: 4,
            bgcolor: "background.paper",
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "action.hover",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <EventNoteOutlinedIcon sx={{ fontSize: 40, color: "text.secondary", opacity: 0.8 }} />
          </Box>
          <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
            No routines scheduled
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
            Build your routine (e.g. 06:30 AM Pray, 07:00 AM DSA Study) and map it to your goal milestones!
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              borderRadius: 3,
              fontWeight: 700,
              px: 4,
              py: 1.5,
              background: "linear-gradient(135deg, #6366F1, #4F46E5)",
              color: "#fff",
              "&:hover": {
                opacity: 0.9,
              }
            }}
          >
            Add Your First Time Block
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {routine.map((block) => {
            const color = getCategoryColor(block.category);
            const isDone = block.isCompletedToday;

            return (
              <Paper
                key={block.id}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  borderLeft: `6px solid ${color}`,
                  border: "1px solid",
                  borderColor: isDone ? "success.light" : "divider",
                  bgcolor: isDone ? "action.selected" : "background.paper",
                  opacity: isDone ? 0.85 : 1,
                  transition: "all 0.2s ease",
                  "&:hover": { boxShadow: 2 },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  {/* Left: Time & Checkbox */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Checkbox
                      checked={isDone}
                      onChange={() => handleToggle(block.id)}
                      icon={<RadioButtonUncheckedIcon fontSize="large" />}
                      checkedIcon={<CheckCircleIcon fontSize="large" color="success" />}
                    />
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ textDecoration: isDone ? "line-through" : "none" }}
                      >
                        {block.title}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
                        <Chip
                          label={`${block.startTime.substring(0, 5)} - ${block.endTime.substring(0, 5)}`}
                          size="small"
                          sx={{ fontWeight: 700, bgcolor: "action.hover" }}
                        />
                        <Chip
                          label={block.category}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: color + "20",
                            color: color,
                            border: `1px solid ${color}`,
                          }}
                        />
                        {block.linkedMilestoneTitle && (
                          <Chip
                            icon={<FlagIcon fontSize="small" />}
                            label={`Milestone: ${block.linkedMilestoneTitle}`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                          />
                        )}
                      </Box>
                      {block.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {block.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Right: Actions */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton color="error" onClick={() => handleDelete(block.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Quick Resource Launcher if Study category */}
                {block.category === "STUDY" && (() => {
                  const relevantResources = resources.filter((r) => {
                    if (block.linkedMilestoneId) {
                      return r.milestoneId === block.linkedMilestoneId;
                    }
                    if (block.linkedGoalId) {
                      return r.goalId === block.linkedGoalId;
                    }
                    return true;
                  });

                  if (relevantResources.length === 0) return null;

                  return (
                    <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px dashed", borderColor: "divider" }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: "block" }}>
                        🔗 Attached Study Resources ({block.linkedMilestoneTitle ? `Milestone: ${block.linkedMilestoneTitle}` : "General"}):
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {relevantResources.map((res) => (
                          <Chip
                            key={res.id}
                            icon={<OpenInNewIcon fontSize="small" />}
                            label={res.title}
                            component="a"
                            href={res.urlOrContent}
                            target="_blank"
                            clickable
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  );
                })()}
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Dialog for Adding New Block */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>➕ Add Routine Time Block</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Title (e.g. DSA Study, Morning Prayer)"
            fullWidth
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mt: 1 }}
          />
          <TextField
            label="Category"
            select
            fullWidth
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Cascading Step 1: Select Goal */}
          <TextField
            select
            label="1. Select Goal (Optional)"
            fullWidth
            value={formData.linkedGoalId}
            onChange={(e) =>
              setFormData({
                ...formData,
                linkedGoalId: e.target.value,
                linkedMilestoneId: "", // Reset milestone when goal changes
              })
            }
          >
            <MenuItem value="">-- None --</MenuItem>
            {goals.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Cascading Step 2: Select Milestone (enabled only when Goal is selected) */}
          <TextField
            select
            label="2. Select Goal Milestone (Optional)"
            fullWidth
            disabled={!formData.linkedGoalId || availableMilestones.length === 0}
            value={formData.linkedMilestoneId}
            onChange={(e) => setFormData({ ...formData, linkedMilestoneId: e.target.value })}
            helperText={
              !formData.linkedGoalId
                ? "Select a Goal first to choose its milestone"
                : availableMilestones.length === 0
                ? "No milestones found for this goal"
                : ""
            }
          >
            <MenuItem value="">-- None --</MenuItem>
            {availableMilestones.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                🚩 {m.title}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Start Time"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
            <TextField
              label="End Time"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
          </Box>
          <TextField
            label="Notes / Description (Optional)"
            multiline
            rows={2}
            fullWidth
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!formData.title}>
            Save Time Block
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
