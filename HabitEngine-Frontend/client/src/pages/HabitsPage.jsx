import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import habitApi from "../api/habitApi";
import HabitCard from "../components/habits/HabitCard";
import HabitFormDialog from "../components/habits/HabitFormDialog";

/**
 * Habits page.
 * Manages habit listings and handles CRUD operations (Create, Read, Update, Delete).
 */
export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [habitToDeleteId, setHabitToDeleteId] = useState(null);

  // Load habits on mount
  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = () => {
    setLoading(true);
    setError("");
    habitApi
      .getAll()
      .then((response) => {
        setHabits(response.data || []);
      })
      .catch((err) => {
        setError(err.message || "Failed to load habits");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCreateOpen = () => {
    setEditingHabit(null);
    setFormOpen(true);
  };

  const handleEditOpen = (habit) => {
    setEditingHabit(habit);
    setFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    setHabitToDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleSaveHabit = (id, payload) => {
    if (id) {
      // Update flow
      return habitApi.update(id, payload).then(() => {
        loadHabits();
      });
    } else {
      // Create flow
      return habitApi.create(payload).then(() => {
        loadHabits();
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (!habitToDeleteId) return;

    habitApi
      .delete(habitToDeleteId)
      .then(() => {
        loadHabits();
        setDeleteConfirmOpen(false);
        setHabitToDeleteId(null);
      })
      .catch((err) => {
        setError(err.message || "Failed to delete habit");
      });
  };

  return (
    <Box>
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h1" sx={{ mb: 0.5 }}>
            Habits
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your daily, weekly, and monthly habits
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateOpen}
          sx={{
            px: 3,
            py: 1.2,
            background: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
            "&:hover": {
              background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
            },
          }}
        >
          New Habit
        </Button>
      </Box>

      {/* Global Error Banner */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Page Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : habits.length === 0 ? (
        /* Empty State */
        <Card elevation={0}>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 8,
            }}
          >
            <Typography variant="h5" sx={{ mb: 1, color: "text.primary" }}>
              No habits created yet
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, textAlign: "center", maxWidth: 400 }}
            >
              Start building better habits by creating your first one. Track daily,
              weekly, or monthly goals.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleCreateOpen}
              sx={{ borderRadius: 2 }}
            >
              Create Your First Habit
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Habit Cards Grid */
        <Grid container spacing={3}>
          {habits.map((habit) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={habit.id}>
              <HabitCard
                habit={habit}
                onEdit={handleEditOpen}
                onDelete={handleDeleteClick}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Habit Create / Edit Form Dialog */}
      <HabitFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        habit={editingHabit}
        onSave={handleSaveHabit}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Habit?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this habit? This action cannot be
            undone, and all tracking history for this habit will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            elevation={0}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
