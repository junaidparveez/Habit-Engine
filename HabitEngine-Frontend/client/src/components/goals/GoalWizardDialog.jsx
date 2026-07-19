import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  TextField,
  IconButton,
  Chip,
  MenuItem,
  Card,
  CardContent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import goalApi from "../../api/goalApi";
import routineApi from "../../api/routineApi";

const STEPS = ["1. Goal Details", "2. Milestones", "3. Study Resources", "4. Daily Routine"];

export default function GoalWizardDialog({ open, onClose, onSuccess }) {
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [goal, setGoal] = useState({ name: "", description: "", targetDate: "" });
  const [milestones, setMilestones] = useState([{ title: "Phase 1 / Month 1", targetWeek: 1 }]);
  const [resources, setResources] = useState([]);
  const [routines, setRoutines] = useState([
    { title: "Study Block", startTime: "07:00", endTime: "08:30", category: "STUDY", milestoneIndex: 0 },
  ]);

  // Temporary item state for step 3 & 4
  const [tempRes, setTempRes] = useState({ title: "", resourceType: "YOUTUBE", urlOrContent: "", milestoneIndex: 0 });

  const handleNext = () => {
    if (activeStep === 0 && !goal.name) return;
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: `Phase ${milestones.length + 1}`, targetWeek: milestones.length + 1 }]);
  };

  const handleRemoveMilestone = (idx) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const handleAddResource = () => {
    if (!tempRes.title) return;
    setResources([...resources, { ...tempRes }]);
    setTempRes({ title: "", resourceType: "YOUTUBE", urlOrContent: "", milestoneIndex: 0 });
  };

  const handleRemoveResource = (idx) => {
    setResources(resources.filter((_, i) => i !== idx));
  };

  const handleAddRoutine = () => {
    setRoutines([
      ...routines,
      { title: "Study Block", startTime: "07:00", endTime: "08:30", category: "STUDY", milestoneIndex: 0 },
    ]);
  };

  const handleRemoveRoutine = (idx) => {
    setRoutines(routines.filter((_, i) => i !== idx));
  };

  const handleFinish = async () => {
    try {
      setSubmitting(true);
      // 1. Create Goal
      const goalRes = await goalApi.create(goal);
      const goalId = goalRes?.data?.id || goalRes?.id;

      // 2. Create Milestones
      const milestoneIdMap = {};
      for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i];
        if (!m.title) continue;
        const mRes = await goalApi.addMilestone(goalId, {
          title: m.title,
          targetWeek: m.targetWeek || i + 1,
        });
        const mId = mRes?.data?.id || mRes?.id;
        milestoneIdMap[i] = mId;
      }

      // 3. Create Resources
      for (const r of resources) {
        const mId = milestoneIdMap[r.milestoneIndex] || null;
        await goalApi.addResource({
          goalId,
          milestoneId: mId,
          title: r.title,
          resourceType: r.resourceType,
          urlOrContent: r.urlOrContent,
        });
      }

      // 4. Create Routine Blocks
      for (const rt of routines) {
        if (!rt.title) continue;
        const mId = milestoneIdMap[rt.milestoneIndex] || null;
        await routineApi.createBlock({
          title: rt.title,
          category: rt.category || "STUDY",
          startTime: rt.startTime + ":00",
          endTime: rt.endTime + ":00",
          linkedGoalId: goalId,
          linkedMilestoneId: mId,
        });
      }

      setSubmitting(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Wizard submit error", err);
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1 }}>
        <AutoAwesomeIcon color="primary" /> Master Discipline Plan Setup
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ pt: 1, pb: 3 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* STEP 1: Goal Details */}
        {activeStep === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Define your high-level objective (e.g. Learn DSA in 4 Months, 30 Days Workout).
            </Typography>
            <TextField
              label="Goal Name"
              required
              fullWidth
              value={goal.name}
              placeholder="e.g. Master DSA in 4 Months"
              onChange={(e) => setGoal({ ...goal, name: e.target.value })}
            />
            <TextField
              label="Description"
              multiline
              rows={2}
              fullWidth
              value={goal.description}
              placeholder="What do you want to achieve?"
              onChange={(e) => setGoal({ ...goal, description: e.target.value })}
            />
            <TextField
              label="Target Finish Date"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={goal.targetDate}
              onChange={(e) => setGoal({ ...goal, targetDate: e.target.value })}
            />
          </Box>
        )}

        {/* STEP 2: Milestones */}
        {activeStep === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Break "{goal.name || "Goal"}" into phases or monthly milestones.
            </Typography>
            {milestones.map((m, idx) => (
              <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Chip label={`P${idx + 1}`} size="small" color="primary" />
                <TextField
                  size="small"
                  fullWidth
                  placeholder={`Phase ${idx + 1} (e.g. Month 1: Trees & Graphs)`}
                  value={m.title}
                  onChange={(e) => {
                    const copy = [...milestones];
                    copy[idx].title = e.target.value;
                    setMilestones(copy);
                  }}
                />
                {milestones.length > 1 && (
                  <IconButton size="small" color="error" onClick={() => handleRemoveMilestone(idx)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={handleAddMilestone} sx={{ alignSelf: "flex-start" }}>
              Add Milestone Phase
            </Button>
          </Box>
        )}

        {/* STEP 3: Study Resources */}
        {activeStep === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Attach YouTube videos, tutorial links, or notes to your milestones.
            </Typography>
            <Card elevation={0} sx={{ p: 2, bgcolor: "action.hover" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <TextField
                  size="small"
                  label="Title (e.g. Striver's Tree Video)"
                  fullWidth
                  value={tempRes.title}
                  onChange={(e) => setTempRes({ ...tempRes, title: e.target.value })}
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    select
                    size="small"
                    label="Type"
                    sx={{ width: 140 }}
                    value={tempRes.resourceType}
                    onChange={(e) => setTempRes({ ...tempRes, resourceType: e.target.value })}
                  >
                    <MenuItem value="YOUTUBE">YouTube</MenuItem>
                    <MenuItem value="URL">Web Link</MenuItem>
                    <MenuItem value="NOTE">Note</MenuItem>
                  </TextField>
                  <TextField
                    select
                    size="small"
                    label="Target Milestone"
                    fullWidth
                    value={tempRes.milestoneIndex}
                    onChange={(e) => setTempRes({ ...tempRes, milestoneIndex: e.target.value })}
                  >
                    {milestones.map((m, i) => (
                      <MenuItem key={i} value={i}>
                        🚩 {m.title || `Phase ${i + 1}`}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <TextField
                  size="small"
                  label="URL or Note text"
                  fullWidth
                  placeholder="https://..."
                  value={tempRes.urlOrContent}
                  onChange={(e) => setTempRes({ ...tempRes, urlOrContent: e.target.value })}
                />
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddResource} disabled={!tempRes.title}>
                  Add Resource
                </Button>
              </Box>
            </Card>

            {resources.map((r, i) => (
              <Box key={i} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  {r.title} ({r.resourceType}) → 🚩 {milestones[r.milestoneIndex]?.title || `Phase ${r.milestoneIndex + 1}`}
                </Typography>
                <IconButton size="small" color="error" onClick={() => handleRemoveResource(i)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {/* STEP 4: Daily Routine */}
        {activeStep === 3 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Set the daily time slots to execute these milestones.
            </Typography>
            {routines.map((rt, idx) => (
              <Card key={idx} elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                      size="small"
                      label="Routine Block Title"
                      fullWidth
                      value={rt.title}
                      onChange={(e) => {
                        const copy = [...routines];
                        copy[idx].title = e.target.value;
                        setRoutines(copy);
                      }}
                    />
                    {routines.length > 1 && (
                      <IconButton size="small" color="error" onClick={() => handleRemoveRoutine(idx)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      size="small"
                      label="Start Time"
                      type="time"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={rt.startTime}
                      onChange={(e) => {
                        const copy = [...routines];
                        copy[idx].startTime = e.target.value;
                        setRoutines(copy);
                      }}
                    />
                    <TextField
                      size="small"
                      label="End Time"
                      type="time"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={rt.endTime}
                      onChange={(e) => {
                        const copy = [...routines];
                        copy[idx].endTime = e.target.value;
                        setRoutines(copy);
                      }}
                    />
                    <TextField
                      select
                      size="small"
                      label="Target Milestone"
                      fullWidth
                      value={rt.milestoneIndex}
                      onChange={(e) => {
                        const copy = [...routines];
                        copy[idx].milestoneIndex = e.target.value;
                        setRoutines(copy);
                      }}
                    >
                      {milestones.map((m, i) => (
                        <MenuItem key={i} value={i}>
                          🚩 {m.title || `Phase ${i + 1}`}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Box>
              </Card>
            ))}
            <Button startIcon={<AddIcon />} onClick={handleAddRoutine} sx={{ alignSelf: "flex-start" }}>
              Add Daily Routine Time Slot
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2.5, justifyContent: "space-between" }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          {activeStep < STEPS.length - 1 ? (
            <Button variant="contained" onClick={handleNext} disabled={activeStep === 0 && !goal.name}>
              Next Step →
            </Button>
          ) : (
            <Button variant="contained" color="success" onClick={handleFinish} disabled={submitting || !goal.name}>
              {submitting ? "Creating Plan..." : "🚀 Finish & Activate Plan"}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
