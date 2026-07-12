import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Alert,
  FormHelperText,
  FormControlLabel,
  Switch,
  Box,
} from "@mui/material";
import dayjs from "dayjs";
import categoryApi from "../../api/categoryApi";
import goalApi from "../../api/goalApi";

const initialFormState = {
  name: "",
  description: "",
  frequency: "DAILY",
  categoryId: "",
  goalId: "",
  startDate: dayjs().format("YYYY-MM-DD"),
  endDate: "",
  isActive: true,
};

/**
 * HabitFormDialog.
 * Dialog form used for creating or updating habits.
 */
export default function HabitFormDialog({ open, onClose, habit, onSave }) {
  const [formData, setFormData] = useState(initialFormState);
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load categories and goals list
  useEffect(() => {
    if (open) {
      categoryApi
        .getAll()
        .then((response) => {
          setCategories(response.data || []);
        })
        .catch((error) => {
          console.error("Failed to load categories", error);
        });

      goalApi
        .getAll()
        .then((response) => {
          if (response.success) {
            setGoals(response.data || []);
          }
        })
        .catch((error) => {
          console.error("Failed to load goals", error);
        });
    }
  }, [open]);

  // Set form state based on initialData (habit editing vs creating)
  useEffect(() => {
    if (open) {
      if (habit) {
        setFormData({
          name: habit.name || "",
          description: habit.description || "",
          frequency: habit.frequency || "DAILY",
          categoryId: habit.category?.id || "",
          goalId: habit.goalId || "",
          startDate: habit.startDate || dayjs().format("YYYY-MM-DD"),
          endDate: habit.endDate || "",
          isActive: habit.isActive !== undefined ? habit.isActive : true,
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
      setApiError("");
    }
  }, [open, habit]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Habit name is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.frequency) newErrors.frequency = "Frequency is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";

    if (
      formData.endDate &&
      dayjs(formData.endDate).isBefore(dayjs(formData.startDate))
    ) {
      newErrors.endDate = "End date cannot be before start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");

    const payload = {
      name: formData.name,
      description: formData.description,
      frequency: formData.frequency,
      categoryId: Number(formData.categoryId),
      goalId: formData.goalId ? Number(formData.goalId) : null,
      startDate: formData.startDate,
      endDate: formData.endDate || null,
    };

    if (habit) {
      payload.isActive = formData.isActive;
    }

    onSave(habit?.id, payload)
      .then(() => {
        onClose();
      })
      .catch((error) => {
        setApiError(error.message || "Failed to save habit");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {habit ? "Edit Habit" : "Create New Habit"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ py: 3 }}>
          {apiError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {apiError}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            {/* Name */}
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Habit Name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                error={!!errors.name}
                helperText={errors.name}
                slotProps={{ htmlInput: { maxLength: 100 } }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                slotProps={{ htmlInput: { maxLength: 1000 } }}
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.categoryId}>
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  label="Category"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: cat.color || "#8B5CF6",
                          }}
                        />
                        {cat.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoryId && (
                  <FormHelperText>{errors.categoryId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Frequency */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.frequency}>
                <InputLabel id="frequency-select-label">Frequency</InputLabel>
                <Select
                  labelId="frequency-select-label"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  label="Frequency"
                >
                  <MenuItem value="DAILY">Daily</MenuItem>
                  <MenuItem value="WEEKLY">Weekly</MenuItem>
                  <MenuItem value="MONTHLY">Monthly</MenuItem>
                </Select>
                {errors.frequency && (
                  <FormHelperText>{errors.frequency}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Start Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="startDate"
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                fullWidth
                error={!!errors.startDate}
                helperText={errors.startDate}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            {/* End Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="endDate"
                label="End Date (Optional)"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                fullWidth
                error={!!errors.endDate}
                helperText={errors.endDate}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            {/* Goal */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="goal-select-label">Goal (Optional)</InputLabel>
                <Select
                  labelId="goal-select-label"
                  name="goalId"
                  value={formData.goalId || ""}
                  onChange={handleChange}
                  label="Goal (Optional)"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {goals.map((goal) => (
                    <MenuItem key={goal.id} value={goal.id}>
                      {goal.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Active Switch (Edit mode only) */}
            {habit && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label={
                    formData.isActive ? "Habit is Active" : "Habit is Paused"
                  }
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              background: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
              "&:hover": {
                background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
              },
            }}
          >
            {habit ? "Save Changes" : "Create Habit"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
