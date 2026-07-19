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
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import goalApi from "../api/goalApi";
import routineApi from "../api/routineApi";
import dayjs from "dayjs";
import GoalWizardDialog from "../components/goals/GoalWizardDialog";

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  // Milestone Modal
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [milestoneData, setMilestoneData] = useState({ title: "", description: "", targetWeek: 1 });

  // Resource Modal
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [resourceData, setResourceData] = useState({ title: "", resourceType: "YOUTUBE", urlOrContent: "", milestoneId: "" });

  // Quick Routine Blocks & Resources Modal for a Milestone
  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const [activeMilestoneInfo, setActiveMilestoneInfo] = useState({ goalId: null, milestoneId: null, milestoneTitle: "" });
  const [quickBlocks, setQuickBlocks] = useState([
    { title: "Study Block 1", startTime: "07:00", endTime: "08:30", category: "STUDY", resourceTitle: "", urlOrContent: "", resourceType: "YOUTUBE" },
  ]);

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
        if (res?.success) {
          setGoals(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

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
    if (window.confirm("Are you sure you want to delete this goal? Linked habits will not be deleted.")) {
      goalApi
        .delete(id)
        .then(() => loadGoals())
        .catch((err) => console.error(err));
    }
  };

  // Milestone actions
  const handleAddMilestone = async () => {
    if (!milestoneData.title || !selectedGoalId) return;
    try {
      await goalApi.addMilestone(selectedGoalId, milestoneData);
      setMilestoneModalOpen(false);
      setMilestoneData({ title: "", description: "", targetWeek: 1 });
      loadGoals();
    } catch (err) {
      console.error("Failed to add milestone", err);
    }
  };

  const handleToggleMilestone = async (milestoneId) => {
    try {
      await goalApi.toggleMilestone(milestoneId);
      loadGoals();
    } catch (err) {
      console.error("Failed to toggle milestone", err);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    try {
      await goalApi.deleteMilestone(milestoneId);
      loadGoals();
    } catch (err) {
      console.error("Failed to delete milestone", err);
    }
  };

  // Resource actions
  const handleAddResource = async () => {
    if (!resourceData.title || !resourceData.urlOrContent || !selectedGoalId) return;
    try {
      await goalApi.addResource({
        ...resourceData,
        goalId: selectedGoalId,
        milestoneId: resourceData.milestoneId || null,
      });
      setResourceModalOpen(false);
      setResourceData({ title: "", resourceType: "YOUTUBE", urlOrContent: "", milestoneId: "" });
      loadGoals();
    } catch (err) {
      console.error("Failed to add resource", err);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      await goalApi.deleteResource(resourceId);
      loadGoals();
    } catch (err) {
      console.error("Failed to delete resource", err);
    }
  };

  // Quick Multi-Routine & Resource creation for a Milestone
  const handleOpenQuickRoutine = (goalId, milestone) => {
    setActiveMilestoneInfo({
      goalId,
      milestoneId: milestone.id,
      milestoneTitle: milestone.title,
    });
    setQuickBlocks([
      { title: `${milestone.title} Study Slot 1`, startTime: "07:00", endTime: "08:30", category: "STUDY", resourceTitle: "", urlOrContent: "", resourceType: "YOUTUBE" },
    ]);
    setRoutineModalOpen(true);
  };

  const handleAddQuickBlockRow = () => {
    setQuickBlocks([
      ...quickBlocks,
      {
        title: `${activeMilestoneInfo.milestoneTitle} Slot ${quickBlocks.length + 1}`,
        startTime: "18:00",
        endTime: "19:30",
        category: "STUDY",
        resourceTitle: "",
        urlOrContent: "",
        resourceType: "YOUTUBE",
      },
    ]);
  };

  const handleRemoveQuickBlockRow = (idx) => {
    setQuickBlocks(quickBlocks.filter((_, i) => i !== idx));
  };

  const handleCreateQuickRoutinesAndResources = async () => {
    try {
      for (const block of quickBlocks) {
        if (!block.title) continue;
        // 1. Create Routine Block
        await routineApi.createBlock({
          title: block.title,
          category: block.category || "STUDY",
          startTime: block.startTime + ":00",
          endTime: block.endTime + ":00",
          linkedGoalId: activeMilestoneInfo.goalId,
          linkedMilestoneId: activeMilestoneInfo.milestoneId,
        });

        // 2. Create Study Resource if URL/content provided
        if (block.urlOrContent) {
          await goalApi.addResource({
            goalId: activeMilestoneInfo.goalId,
            milestoneId: activeMilestoneInfo.milestoneId,
            title: block.resourceTitle || block.title,
            resourceType: block.resourceType || "YOUTUBE",
            urlOrContent: block.urlOrContent,
          });
        }
      }

      setRoutineModalOpen(false);
      loadGoals();
    } catch (err) {
      console.error("Failed to create quick routines/resources", err);
    }
  };

  const currentGoal = goals.find((g) => g.id === selectedGoalId);
  const currentMilestones = currentGoal?.milestones || [];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Top Banner & Quick Wizard Launcher */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
            Long-Term Goals & Roadmaps
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Break goals into milestones, attach study links, and schedule daily execution routines in one place.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setWizardOpen(true)}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            🧙 Full Goal Setup Wizard
          </Button>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ borderRadius: 2, fontWeight: 700 }}>
            New Goal
          </Button>
        </Box>
      </Box>

      {goals.length === 0 ? (
        <Card elevation={0}>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
            <Typography variant="h5" sx={{ mb: 1 }}>
              No Goals Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Use the Master Setup Wizard to build a complete goal, milestone, study resource, and routine plan in 1 minute!
            </Typography>
            <Button variant="contained" color="secondary" startIcon={<AutoAwesomeIcon />} onClick={() => setWizardOpen(true)}>
              Launch Setup Wizard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {goals.map((goal) => (
            <Grid size={{ xs: 12, md: 6 }} key={goal.id}>
              <Card elevation={0} sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  {/* Top Bar */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Chip
                      label={goal.status}
                      size="small"
                      color={goal.status === "ACHIEVED" ? "success" : goal.status === "ACTIVE" ? "primary" : "default"}
                      sx={{ fontSize: "0.7rem", fontWeight: 700, height: 22 }}
                    />
                    <Box>
                      <IconButton size="small" onClick={() => handleOpen(goal)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(goal.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {goal.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {goal.description || "No description provided."}
                  </Typography>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Overall Milestone Progress
                      </Typography>
                      <Typography variant="caption" color="primary.main" fontWeight={700}>
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

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Linked Habits: {goal.totalHabits}
                    </Typography>
                    {goal.targetDate && (
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Target: {dayjs(goal.targetDate).format("MMM D, YYYY")}
                      </Typography>
                    )}
                  </Box>

                  {/* Accordion 1: Milestones */}
                  <Accordion elevation={0} defaultExpanded sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, mb: 1.5, "&:before": { display: "none" } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        🚩 Goal Milestones ({goal.milestones ? goal.milestones.filter((m) => m.isCompleted).length : 0}/{goal.milestones?.length || 0})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      {goal.milestones && goal.milestones.length > 0 ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                          {goal.milestones.map((m) => {
                            const milestoneResources = (goal.resources || []).filter((r) => r.milestoneId === m.id);

                            return (
                              <Box key={m.id} sx={{ bgcolor: "action.hover", p: 1.5, borderRadius: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Checkbox
                                      checked={m.isCompleted}
                                      onChange={() => handleToggleMilestone(m.id)}
                                      icon={<RadioButtonUncheckedIcon fontSize="small" />}
                                      checkedIcon={<CheckCircleIcon fontSize="small" color="success" />}
                                      size="small"
                                    />
                                    <Typography variant="body2" sx={{ textDecoration: m.isCompleted ? "line-through" : "none", fontWeight: 700 }}>
                                      {m.title}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <Tooltip title="Add Multiple Routines & Resources for this Milestone">
                                      <IconButton size="small" color="primary" onClick={() => handleOpenQuickRoutine(goal.id, m)}>
                                        <AccessTimeIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <IconButton size="small" color="error" onClick={() => handleDeleteMilestone(m.id)}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>

                                {/* Resources mapped directly to this milestone */}
                                {milestoneResources.length > 0 && (
                                  <Box sx={{ mt: 1, pl: 4, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                    {milestoneResources.map((r) => (
                                      <Chip
                                        key={r.id}
                                        icon={<OpenInNewIcon fontSize="small" />}
                                        label={r.title}
                                        component="a"
                                        href={r.urlOrContent}
                                        target="_blank"
                                        clickable
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        onDelete={() => handleDeleteResource(r.id)}
                                        sx={{ fontSize: "0.7rem" }}
                                      />
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            );
                          })}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No milestones added yet. Break this goal into phases!
                        </Typography>
                      )}
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        sx={{ mt: 1.5, fontWeight: 700 }}
                        onClick={() => {
                          setSelectedGoalId(goal.id);
                          setMilestoneModalOpen(true);
                        }}
                      >
                        Add Milestone
                      </Button>
                    </AccordionDetails>
                  </Accordion>

                  {/* Accordion 2: Study Resources */}
                  <Accordion elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, "&:before": { display: "none" } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        📚 All Study Resources & Links ({goal.resources?.length || 0})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      {goal.resources && goal.resources.length > 0 ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {goal.resources.map((r) => {
                            const milestone = goal.milestones?.find((m) => m.id === r.milestoneId);

                            return (
                              <Box key={r.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "action.hover", p: 1, borderRadius: 1.5 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Chip label={r.resourceType} size="small" color="secondary" sx={{ fontSize: "0.65rem", height: 20 }} />
                                  <Typography
                                    variant="body2"
                                    component="a"
                                    href={r.urlOrContent}
                                    target="_blank"
                                    rel="noreferrer"
                                    sx={{ fontWeight: 600, color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                                  >
                                    {r.title} <OpenInNewIcon sx={{ fontSize: 12, verticalAlign: "middle" }} />
                                  </Typography>
                                  {milestone && (
                                    <Chip label={`🚩 ${milestone.title}`} size="small" variant="outlined" sx={{ fontSize: "0.65rem", height: 20 }} />
                                  )}
                                </Box>
                                <IconButton size="small" color="error" onClick={() => handleDeleteResource(r.id)}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            );
                          })}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No resources linked yet. Add YouTube tutorials or notes!
                        </Typography>
                      )}
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        sx={{ mt: 1.5, fontWeight: 700 }}
                        onClick={() => {
                          setSelectedGoalId(goal.id);
                          setResourceModalOpen(true);
                        }}
                      >
                        Add Resource Link / Note
                      </Button>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Goal Modal */}
      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{editingGoal ? "Edit Goal" : "Create Goal"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField label="Goal Name (e.g. Learn DSA in 4 Months)" fullWidth required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <TextField label="Description" fullWidth multiline rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <TextField label="Target Date" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} value={formData.targetDate} onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })} />
            {editingGoal && (
              <TextField select label="Status" fullWidth slotProps={{ select: { native: true } }} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="ACHIEVED">ACHIEVED</option>
                <option value="ABANDONED">ABANDONED</option>
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!formData.name}>
            Save Goal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Milestone Modal */}
      <Dialog open={milestoneModalOpen} onClose={() => setMilestoneModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>🚩 Add Goal Milestone</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField label="Milestone Title (e.g. Month 1: Trees & Graphs)" fullWidth required value={milestoneData.title} onChange={(e) => setMilestoneData({ ...milestoneData, title: e.target.value })} sx={{ mt: 1 }} />
          <TextField label="Target Week / Month (Number)" type="number" fullWidth value={milestoneData.targetWeek} onChange={(e) => setMilestoneData({ ...milestoneData, targetWeek: parseInt(e.target.value) || 1 })} />
          <TextField label="Description (Optional)" fullWidth multiline rows={2} value={milestoneData.description} onChange={(e) => setMilestoneData({ ...milestoneData, description: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setMilestoneModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddMilestone} disabled={!milestoneData.title}>
            Add Milestone
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Resource Modal */}
      <Dialog open={resourceModalOpen} onClose={() => setResourceModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>📚 Add Study Resource / Link</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField label="Title (e.g. Striver's Tree Traversal Video)" fullWidth required value={resourceData.title} onChange={(e) => setResourceData({ ...resourceData, title: e.target.value })} sx={{ mt: 1 }} />
          <TextField select label="Resource Type" fullWidth value={resourceData.resourceType} onChange={(e) => setResourceData({ ...resourceData, resourceType: e.target.value })}>
            <MenuItem value="YOUTUBE">YouTube Video</MenuItem>
            <MenuItem value="URL">Web Link / Article</MenuItem>
            <MenuItem value="NOTE">Quick Note / Markdown</MenuItem>
          </TextField>
          {currentMilestones.length > 0 && (
            <TextField
              select
              label="Attach to Specific Milestone (Optional)"
              fullWidth
              value={resourceData.milestoneId || ""}
              onChange={(e) => setResourceData({ ...resourceData, milestoneId: e.target.value })}
            >
              <MenuItem value="">-- Entire Goal --</MenuItem>
              {currentMilestones.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  🚩 {m.title}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField label="URL or Note Content" fullWidth multiline rows={3} placeholder="https://youtube.com/watch?v=..." value={resourceData.urlOrContent} onChange={(e) => setResourceData({ ...resourceData, urlOrContent: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setResourceModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddResource} disabled={!resourceData.title}>
            Save Resource
          </Button>
        </DialogActions>
      </Dialog>

      {/* Multi-Routine & Resource Creator Modal for Milestone */}
      <Dialog open={routineModalOpen} onClose={() => setRoutineModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>⏰ Create Daily Routines & Study Links for "{activeMilestoneInfo.milestoneTitle}"</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Set multiple daily time slots and attach study links (YouTube, notes) for this milestone in one go!
          </Typography>

          {quickBlocks.map((block, idx) => (
            <Card key={idx} elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", justify: "space-between", alignItems: "center", gap: 1 }}>
                  <TextField
                    label={`Slot #${idx + 1} Title`}
                    size="small"
                    fullWidth
                    required
                    value={block.title}
                    onChange={(e) => {
                      const copy = [...quickBlocks];
                      copy[idx].title = e.target.value;
                      setQuickBlocks(copy);
                    }}
                  />
                  {quickBlocks.length > 1 && (
                    <IconButton size="small" color="error" onClick={() => handleRemoveQuickBlockRow(idx)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <TextField
                    label="Start Time"
                    type="time"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={block.startTime}
                    onChange={(e) => {
                      const copy = [...quickBlocks];
                      copy[idx].startTime = e.target.value;
                      setQuickBlocks(copy);
                    }}
                  />
                  <TextField
                    label="End Time"
                    type="time"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={block.endTime}
                    onChange={(e) => {
                      const copy = [...quickBlocks];
                      copy[idx].endTime = e.target.value;
                      setQuickBlocks(copy);
                    }}
                  />
                </Box>

                {/* Resource URL / Note Link for this slot */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    select
                    label="Resource Type"
                    size="small"
                    sx={{ width: 140 }}
                    value={block.resourceType}
                    onChange={(e) => {
                      const copy = [...quickBlocks];
                      copy[idx].resourceType = e.target.value;
                      setQuickBlocks(copy);
                    }}
                  >
                    <MenuItem value="YOUTUBE">YouTube</MenuItem>
                    <MenuItem value="URL">Web Link</MenuItem>
                    <MenuItem value="NOTE">Note</MenuItem>
                  </TextField>
                  <TextField
                    label="Study Resource URL or Note (Optional)"
                    placeholder="https://youtube.com/watch?v=..."
                    size="small"
                    fullWidth
                    value={block.urlOrContent}
                    onChange={(e) => {
                      const copy = [...quickBlocks];
                      copy[idx].urlOrContent = e.target.value;
                      setQuickBlocks(copy);
                    }}
                  />
                </Box>
              </Box>
            </Card>
          ))}

          <Button startIcon={<AddIcon />} onClick={handleAddQuickBlockRow} sx={{ alignSelf: "flex-start", fontWeight: 700 }}>
            + Add Another Routine Time Slot
          </Button>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setRoutineModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateQuickRoutinesAndResources}>
            Save All Routines & Study Links
          </Button>
        </DialogActions>
      </Dialog>

      {/* Master Goal Wizard */}
      <GoalWizardDialog open={wizardOpen} onClose={() => setWizardOpen(false)} onSuccess={loadGoals} />
    </Box>
  );
}
