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
import { alpha, useTheme } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/CheckCircleOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import FireIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import TrophyIcon from "@mui/icons-material/EmojiEventsOutlined";
import AccessTimeIcon from "@mui/icons-material/ScheduleOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesomeOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import healthApi from "../api/healthApi";
import dashboardApi from "../api/dashboardApi";
import habitApi from "../api/habitApi";
import routineApi from "../api/routineApi";
import goalApi from "../api/goalApi";
import dayjs from "dayjs";
import {
  PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from "recharts";
import PageHeader from "../components/common/PageHeader";
import { brand } from "../styles/theme";
import LevelUpCelebration from "../components/gamification/LevelUpCelebration";
import { useAuth } from "../contexts/AuthContext";
import userApi from "../api/userApi";
import statisticsApi from "../api/statisticsApi";
import { useNavigate } from "react-router-dom";
import GoalWizardDialog from "../components/goals/GoalWizardDialog";

export default function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
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
      label: "Today's habits",
      value: stats ? `${stats.completedToday}/${stats.totalToday}` : "–",
      icon: CheckIcon,
      color: brand.success,
    },
    {
      label: "Current streak",
      value: stats ? stats.globalCurrentStreak : "–",
      unit: stats ? "days" : "",
      icon: FireIcon,
      color: brand.warning,
    },
    {
      label: "Discipline score",
      value: `${disciplineScore}%`,
      isChart: true,
      chartValue: disciplineScore,
      color: brand.primary,
    },
    {
      label: "Total XP",
      value: stats ? Number(stats.totalXp).toLocaleString() : "–",
      icon: TrophyIcon,
      color: brand.secondary,
    },
  ];

  const sectionTitleSx = { fontSize: "0.975rem", fontWeight: 600 };
  const emptyStateSx = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    py: 5,
    gap: 1.25,
    borderRadius: 2,
    border: "1px dashed",
    borderColor: "divider",
    textAlign: "center",
  };
  const emptyIconSx = {
    width: 40,
    height: 40,
    borderRadius: 2,
    bgcolor: "action.selected",
    color: "primary.main",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mb: 0.5,
  };

  const greeting = (() => {
    const hour = dayjs().hour();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();
  const firstName = (user?.displayName || user?.username || "").split(" ")[0];

  return (
    <Box>
      <LevelUpCelebration open={levelUpData.open} level={levelUpData.level} onClose={() => setLevelUpData({ open: false, level: 0 })} />

      <PageHeader
        title={firstName ? `${greeting}, ${firstName}` : greeting}
        subtitle={`${dayjs().format("dddd, MMMM D")} · Here's how your day is shaping up.`}
        actions={
          <Button variant="contained" startIcon={<AutoAwesomeIcon />} onClick={() => setWizardOpen(true)}>
            New goal plan
          </Button>
        }
      />

      {/* Stats Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={stat.label}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {stat.label}
                    </Typography>
                    {stat.isChart ? (
                      <PieChart width={28} height={28}>
                        <Pie data={[{ value: stat.chartValue }, { value: 100 - stat.chartValue }]} cx={14} cy={14} innerRadius={9} outerRadius={13} startAngle={90} endAngle={-270} dataKey="value" stroke="none" isAnimationActive={false}>
                          <Cell fill={stat.color} />
                          <Cell fill={alpha(stat.color, 0.18)} />
                        </Pie>
                      </PieChart>
                    ) : (
                      <Box sx={{ width: 28, height: 28, borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: alpha(stat.color, 0.12) }}>
                        <Icon sx={{ color: stat.color, fontSize: 17 }} />
                      </Box>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.2 }}>
                    {stat.value}
                    {stat.unit && (
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.75, fontWeight: 500 }}>
                        {stat.unit}
                      </Typography>
                    )}
                  </Typography>
                  {stat.label === "Total XP" && (
                    <Box sx={{ mt: 1.5 }}>
                      <LinearProgress variant="determinate" value={user ? Math.min(100, (user.currentXp / (user.nextLevelXp || 100)) * 100) : 0} color="secondary" />
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
                        Level {user?.level || 1} · {user?.currentXp || 0} / {user?.nextLevelXp || 100} XP
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Today's Schedule & Routine Section */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box>
            <Typography sx={sectionTitleSx}>Today&apos;s routine</Typography>
            {totalRoutine > 0 && (
              <Typography variant="caption" color="text.secondary">
                {completedRoutine} of {totalRoutine} blocks done
              </Typography>
            )}
          </Box>
          <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: "16px !important" }} />} onClick={() => navigate("/routine")}>
            Manage
          </Button>
        </Box>

        {loadingRoutine ? (
          <CircularProgress size={20} />
        ) : routine.length === 0 ? (
          <Box sx={emptyStateSx}>
            <Box sx={emptyIconSx}>
              <AccessTimeIcon fontSize="small" />
            </Box>
            <Typography variant="body2" fontWeight={600}>
              No routine yet
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Plan your day with focused time blocks.
            </Typography>
            <Button variant="contained" size="small" onClick={() => navigate("/routine")} sx={{ mt: 1 }}>
              Create schedule
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {routine.map((block) => (
              <Box
                key={block.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 0.75,
                  pl: 0.5,
                  pr: 1.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: block.isCompletedToday ? "action.hover" : "transparent",
                  transition: "background-color 0.15s ease",
                }}
              >
                <Checkbox
                  checked={block.isCompletedToday}
                  onChange={() => handleToggleRoutine(block.id)}
                  icon={<RadioButtonUncheckedIcon fontSize="small" />}
                  checkedIcon={<CheckCircleIcon fontSize="small" color="success" />}
                />
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{
                    flex: 1,
                    textDecoration: block.isCompletedToday ? "line-through" : "none",
                    color: block.isCompletedToday ? "text.secondary" : "text.primary",
                  }}
                >
                  {block.title}
                </Typography>
                <Chip label={block.category} size="small" variant="outlined" sx={{ height: 22, display: { xs: "none", sm: "inline-flex" } }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums", minWidth: 84, textAlign: "right" }}>
                  {block.startTime.substring(0, 5)} – {block.endTime.substring(0, 5)}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Card>

      {/* Progress Chart & Today's Habits */}
      <Grid container spacing={3}>
        {/* Progress Chart */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2, flexWrap: "wrap" }}>
              <Typography sx={sectionTitleSx}>Habit completion trend</Typography>
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
            ) : dailyProgress.length === 0 || dailyProgress.every(d => d.completedCount === 0) ? (
              <Box sx={{ ...emptyStateSx, height: 260 }}>
                <Box sx={emptyIconSx}>
                  <TrendingUpIcon fontSize="small" />
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  No activity yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Complete habits to start tracking your trend.
                </Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={dailyProgress} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={theme.palette.divider} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} dy={8} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                  <RechartsTooltip
                    cursor={{ stroke: theme.palette.divider }}
                    contentStyle={{
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: theme.palette.text.secondary }}
                    formatter={(value) => [value, "Completed"]}
                  />
                  <Area type="monotone" dataKey="completedCount" stroke={theme.palette.primary.main} strokeWidth={2} fill="url(#trendFill)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </Grid>

        {/* Today's Habits */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ p: 3, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography sx={sectionTitleSx}>Today&apos;s habits</Typography>
              {todayHabits.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {todayHabits.filter((h) => h.completedToday).length} / {todayHabits.length} done
                </Typography>
              )}
            </Box>
            {loadingHabits ? (
              <CircularProgress size={20} />
            ) : todayHabits.length === 0 ? (
              <Box sx={emptyStateSx}>
                <Typography variant="body2" fontWeight={600}>
                  No habits scheduled today
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Small daily actions add up. Start with one.
                </Typography>
                <Button variant="outlined" size="small" onClick={() => navigate("/habits")} sx={{ mt: 1 }}>
                  Create a habit
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {todayHabits.map((item) => (
                  <Box
                    key={item.habit.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      py: 0.25,
                      borderRadius: 2,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Checkbox checked={item.completedToday} onChange={() => handleToggleCompletion(item)} icon={<RadioButtonUncheckedIcon fontSize="small" />} checkedIcon={<CheckCircleIcon fontSize="small" color="success" />} />
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{
                        textDecoration: item.completedToday ? "line-through" : "none",
                        color: item.completedToday ? "text.secondary" : "text.primary",
                      }}
                    >
                      {item.habit.name}
                    </Typography>
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
