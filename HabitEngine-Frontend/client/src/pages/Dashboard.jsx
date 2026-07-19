import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  LinearProgress,
  Button,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/CheckCircleOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import FireIcon from "@mui/icons-material/LocalFireDepartment";
import TrophyIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import healthApi from "../api/healthApi";
import dashboardApi from "../api/dashboardApi";
import habitApi from "../api/habitApi";
import routineApi from "../api/routineApi";
import goalApi from "../api/goalApi";
import dayjs from "dayjs";
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from "recharts";
import LevelUpCelebration from "../components/gamification/LevelUpCelebration";
import { useAuth } from "../contexts/AuthContext";
import userApi from "../api/userApi";
import statisticsApi from "../api/statisticsApi";
import { useNavigate } from "react-router-dom";
import GoalWizardDialog from "../components/goals/GoalWizardDialog";

export default function Dashboard() {
  const navigate = useNavigate();
  const [backendStatus, setBackendStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [todayHabits, setTodayHabits] = useState([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [routine, setRoutine] = useState([]);
  const [resources, setResources] = useState([]);
  const [loadingRoutine, setLoadingRoutine] = useState(true);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [dailyProgress, setDailyProgress] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [chartFilter, setChartFilter] = useState("daily");

  const { user, updateUser } = useAuth();
  const [levelUpData, setLevelUpData] = useState({ open: false, level: 0 });

  useEffect(() => {
    healthApi
      .check()
      .then((response) => {
        setBackendStatus(response?.status || "UP");
      })
      .catch(() => {
        setBackendStatus("DOWN");
      })
      .finally(() => {
        setLoading(false);
      });

    loadTodayHabits();
    loadRoutineAndResources();
    loadStats();
  }, []);

  useEffect(() => {
    loadDailyProgress();
  }, [chartFilter]);

  const loadTodayHabits = () => {
    setLoadingHabits(true);
    dashboardApi
      .getTodayHabits()
      .then((res) => {
        if (res?.success) {
          setTodayHabits(res.data);
        }
      })
      .catch((err) => console.error("Failed to load today's habits", err))
      .finally(() => setLoadingHabits(false));
  };

  const loadRoutineAndResources = async () => {
    try {
      setLoadingRoutine(true);
      const [rRes, resRes] = await Promise.all([
        routineApi.getRoutine(),
        goalApi.getResources(),
      ]);
      const routineList = Array.isArray(rRes) ? rRes : (rRes?.data || []);
      const resourceList = Array.isArray(resRes) ? resRes : (resRes?.data || []);
      setRoutine(routineList);
      setResources(resourceList);
    } catch (err) {
      console.error("Failed to load routine data", err);
      setRoutine([]);
      setResources([]);
    } finally {
      setLoadingRoutine(false);
    }
  };

  const handleToggleRoutine = async (id) => {
    setRoutine((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, isCompletedToday: !b.isCompletedToday } : b
      )
    );
    await routineApi.toggleBlock(id);
  };

  const loadStats = () => {
    setLoadingStats(true);
    dashboardApi
      .getStats()
      .then((res) => {
        if (res?.success) {
          setStats(res.data);
        }
      })
      .catch((err) => console.error("Failed to load stats", err))
      .finally(() => setLoadingStats(false));
  };

  const loadDailyProgress = () => {
    setLoadingProgress(true);
    const endDate = dayjs().format("YYYY-MM-DD");
    let startDate;
    if (chartFilter === "daily") {
      startDate = dayjs().subtract(7, "day").format("YYYY-MM-DD");
    } else if (chartFilter === "weekly") {
      startDate = dayjs().subtract(4, "week").format("YYYY-MM-DD");
    } else if (chartFilter === "monthly") {
      startDate = dayjs().subtract(6, "month").format("YYYY-MM-DD");
    }
    
    statisticsApi
      .getHeatmap(startDate, endDate)
      .then((res) => {
        if (res?.success) {
          let formatted = [];
          if (chartFilter === "daily") {
            formatted = res.data.map(d => ({
              ...d,
              label: dayjs(d.date).format("MMM D")
            }));
          } else if (chartFilter === "weekly") {
            const grouped = {};
            res.data.forEach(d => {
              const weekStart = dayjs(d.date).startOf("week").format("MMM D");
              if (!grouped[weekStart]) grouped[weekStart] = { label: weekStart, completedCount: 0 };
              grouped[weekStart].completedCount += d.completedCount;
            });
            formatted = Object.values(grouped);
          } else if (chartFilter === "monthly") {
            const grouped = {};
            res.data.forEach(d => {
              const monthStart = dayjs(d.date).startOf("month").format("MMM YYYY");
              if (!grouped[monthStart]) grouped[monthStart] = { label: monthStart, completedCount: 0 };
              grouped[monthStart].completedCount += d.completedCount;
            });
            formatted = Object.values(grouped);
          }
          setDailyProgress(formatted);
        }
      })
      .catch((err) => console.error("Failed to load daily progress", err))
      .finally(() => setLoadingProgress(false));
  };

  const handleToggleCompletion = async (item) => {
    const dateStr = dayjs().format("YYYY-MM-DD");
    try {
      if (item.completedToday) {
        await habitApi.unmarkCompleted(item.habit.id, dateStr);
      } else {
        await habitApi.markCompleted(item.habit.id, {
          completionDate: dateStr,
          note: "",
        });
      }
      setTodayHabits((prev) =>
        prev.map((h) => {
          if (h.habit.id === item.habit.id) {
            return { ...h, completedToday: !h.completedToday };
          }
          return h;
        }),
      );
      loadStats();
      loadDailyProgress();

      const progressRes = await userApi.getProgress();
      if (progressRes.data?.success) {
        const newProgress = progressRes.data.data;
        if (user && newProgress.level > user.level) {
          setLevelUpData({ open: true, level: newProgress.level });
        }
        updateUser(newProgress);
      }
    } catch (error) {
      console.error("Failed to toggle habit completion", error);
    }
  };

  const safeRoutine = Array.isArray(routine) ? routine : [];
  const completedRoutine = safeRoutine.filter((b) => b.isCompletedToday).length;
  const totalRoutine = safeRoutine.length;
  const disciplineScore = totalRoutine > 0 ? Math.round((completedRoutine / totalRoutine) * 100) : 0;

  const statCards = [
    {
      label: "Today's Habits",
      value: stats ? `${stats.completedToday} / ${stats.totalToday}` : "-",
      icon: CheckIcon,
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.1)",
    },
    {
      label: "Current Streak",
      value: stats ? `${stats.globalCurrentStreak} days` : "-",
      icon: FireIcon,
      color: "#F59E0B",
      bgColor: "rgba(245, 158, 11, 0.1)",
    },
    {
      label: "Discipline Score",
      value: `${disciplineScore}%`,
      isChart: true,
      chartValue: disciplineScore,
      color: "#8B5CF6",
      bgColor: "rgba(139, 92, 246, 0.1)",
    },
    {
      label: "Total XP",
      value: stats ? `${stats.totalXp}` : "-",
      icon: TrophyIcon,
      color: "#06B6D4",
      bgColor: "rgba(6, 182, 212, 0.1)",
    },
  ];

  return (
    <Box>
      <LevelUpCelebration open={levelUpData.open} level={levelUpData.level} onClose={() => setLevelUpData({ open: false, level: 0 })} />

      {/* Page Header */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
            Dashboard
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              Welcome back to HabitEngine
            </Typography>
            {loading ? (
              <CircularProgress size={14} />
            ) : (
              <Chip
                label={`API: ${backendStatus}`}
                size="small"
                color={backendStatus === "UP" ? "success" : "error"}
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 22 }}
              />
            )}
          </Box>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AutoAwesomeIcon />}
          onClick={() => setWizardOpen(true)}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          🧙 Setup New Goal & Routine Plan
        </Button>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={stat.label}>
              <Card elevation={0} sx={{ height: "100%", borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    {stat.isChart ? (
                      <Box sx={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <PieChart width={44} height={44}>
                          <Pie data={[{ value: stat.chartValue }, { value: 100 - stat.chartValue }]} cx={20} cy={20} innerRadius={15} outerRadius={20} startAngle={90} endAngle={-270} dataKey="value" stroke="none">
                            <Cell fill={stat.color} />
                            <Cell fill={stat.bgColor} />
                          </Pie>
                        </PieChart>
                      </Box>
                    ) : (
                      <Box sx={{ width: 44, height: 44, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: stat.bgColor }}>
                        <Icon sx={{ color: stat.color, fontSize: "1.4rem" }} />
                      </Box>
                    )}
                  </Box>
                  <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Today's Schedule & Routine Section */}
      <Card elevation={0} sx={{ mb: 4, p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccessTimeIcon color="primary" />
            <Typography variant="h6" fontWeight={800}>
              Today's Routine & Schedule
            </Typography>
          </Box>
          <Button size="small" onClick={() => navigate("/routine")} sx={{ fontWeight: 700 }}>
            Manage Routine →
          </Button>
        </Box>

        {loadingRoutine ? (
          <CircularProgress size={20} />
        ) : routine.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No time blocks configured for today. Click "Manage Routine" to create your day's schedule!
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {routine.map((block) => (
              <Box
                key={block.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: block.isCompletedToday ? "action.selected" : "background.paper",
                  border: "1px solid",
                  borderColor: block.isCompletedToday ? "success.light" : "divider",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Checkbox
                    checked={block.isCompletedToday}
                    onChange={() => handleToggleRoutine(block.id)}
                    icon={<RadioButtonUncheckedIcon fontSize="small" />}
                    checkedIcon={<CheckCircleIcon fontSize="small" color="success" />}
                  />
                  <Box>
                    <Typography variant="body1" fontWeight={700} sx={{ textDecoration: block.isCompletedToday ? "line-through" : "none" }}>
                      {block.title}
                    </Typography>
                    <Chip label={`${block.startTime.substring(0, 5)} - ${block.endTime.substring(0, 5)}`} size="small" sx={{ fontSize: "0.65rem", height: 18, mr: 1 }} />
                    <Chip label={block.category} size="small" color="primary" variant="outlined" sx={{ fontSize: "0.65rem", height: 18 }} />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Card>

      {/* Progress Chart & Today's Habits */}
      <Grid container spacing={3}>
        {/* Progress Chart */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" fontWeight={800}>
                Habit Completion Trend
              </Typography>
              <ToggleButtonGroup value={chartFilter} exclusive onChange={(e, val) => val && setChartFilter(val)} size="small">
                <ToggleButton value="daily">Daily</ToggleButton>
                <ToggleButton value="weekly">Weekly</ToggleButton>
                <ToggleButton value="monthly">Monthly</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            {loadingProgress ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={dailyProgress}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="completedCount" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Grid>

        {/* Today's Habits */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", height: "100%" }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
              Today's Habits Checklist
            </Typography>
            {loadingHabits ? (
              <CircularProgress size={20} />
            ) : todayHabits.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No active habits configured for today.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {todayHabits.map((item) => (
                  <Box key={item.habit.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Checkbox checked={item.completedToday} onChange={() => handleToggleCompletion(item)} icon={<RadioButtonUncheckedIcon fontSize="small" />} checkedIcon={<CheckCircleIcon fontSize="small" color="success" />} />
                      <Typography variant="body2" fontWeight={700} sx={{ textDecoration: item.completedToday ? "line-through" : "none" }}>
                        {item.habit.name}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Master Goal Wizard */}
      <GoalWizardDialog open={wizardOpen} onClose={() => setWizardOpen(false)} onSuccess={loadRoutineAndResources} />
    </Box>
  );
}
