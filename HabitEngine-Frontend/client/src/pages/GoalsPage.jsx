import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import goalApi from "../api/goalApi";
import dayjs from "dayjs";

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetDate: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    setLoading(true);
    goalApi
      .getAll()
      .then((res) => {
        debugger;
        console.log("GoalsPage: loadGoals response", res);
        if (res?.success) {
          setGoals(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  console.log("GoalsPage: goals", goals);
  const handleOpen = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        description: goal.description || "",
        targetDate: goal.targetDate || "",
        status: goal.status,
      });
    } else {
      setEditingGoal(null);
      setFormData({
        name: "",
        description: "",
        targetDate: "",
        status: "ACTIVE",
      });
    }
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const handleSave = () => {
    const apiCall = editingGoal
      ? goalApi.update(editingGoal.id, formData)
      : goalApi.create(formData);

    apiCall
      .then(() => {
        handleClose();
        loadGoals();
      })
      .catch((err) => console.error(err));
  };

  const handleDelete = (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this goal? Linked habits will not be deleted.",
      )
    ) {
      goalApi
        .delete(id)
        .then(() => loadGoals())
        .catch((err) => console.error(err));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h1" sx={{ mb: 0.5 }}>
            Goals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set long-term objectives and link habits to them
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: 2 }}
        >
          New Goal
        </Button>
      </Box>

      {goals.length === 0 ? (
        <Card elevation={0}>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 8,
            }}
          >
            <Typography variant="h5" sx={{ mb: 1 }}>
              No Goals Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create a goal to start grouping your habits and tracking long-term
              progress.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
            >
              Create First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {goals.map((goal) => (
            <Grid item xs={12} md={6} lg={4} key={goal.id}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Chip
                      label={goal.status}
                      size="small"
                      color={
                        goal.status === "ACHIEVED"
                          ? "success"
                          : goal.status === "ACTIVE"
                            ? "primary"
                            : "default"
                      }
                      sx={{ fontSize: "0.7rem", height: 20 }}
                    />
                    <Box>
                      <IconButton size="small" onClick={() => handleOpen(goal)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                    {goal.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3, minHeight: 40 }}
                  >
                    {goal.description || "No description provided."}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        Progress
                      </Typography>
                      <Typography
                        variant="caption"
                        color="primary.main"
                        fontWeight={600}
                      >
                        {goal.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={goal.progress}
                      sx={{ height: 8, borderRadius: 4 }}
                      color={goal.progress === 100 ? "success" : "primary"}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Linked Habits: {goal.totalHabits}
                    </Typography>
                    {goal.targetDate && (
                      <Typography variant="caption" color="text.secondary">
                        Target: {dayjs(goal.targetDate).format("MMM D, YYYY")}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Goal Modal */}
      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingGoal ? "Edit Goal" : "Create Goal"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Goal Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <TextField
              label="Target Date"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={formData.targetDate}
              onChange={(e) =>
                setFormData({ ...formData, targetDate: e.target.value })
              }
            />
            {editingGoal && (
              <TextField
                select
                label="Status"
                fullWidth
                slotProps={{ select: { native: true } }}
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="ACHIEVED">ACHIEVED</option>
                <option value="ABANDONED">ABANDONED</option>
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!formData.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
