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
} from "@mui/material";
import CheckIcon from "@mui/icons-material/CheckCircleOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import FireIcon from "@mui/icons-material/LocalFireDepartment";
import TrendIcon from "@mui/icons-material/TrendingUp";
import TrophyIcon from "@mui/icons-material/EmojiEvents";
import CategoryIcon from "@mui/icons-material/Folder";
import healthApi from "../api/healthApi";
import dashboardApi from "../api/dashboardApi";
import habitApi from "../api/habitApi";
import dayjs from "dayjs";
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from "recharts";
import LevelUpCelebration from "../components/gamification/LevelUpCelebration";
import { useAuth } from "../contexts/AuthContext";
import userApi from "../api/userApi";
import statisticsApi from "../api/statisticsApi";

/**
 * Dashboard page — main landing page.
 * Shows today's habits, stats overview, and activity summary.
 */
export default function Dashboard() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayHabits, setTodayHabits] = useState([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [dailyProgress, setDailyProgress] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [chartFilter, setChartFilter] = useState("daily");

  // Gamification state
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
      // Update local state for immediate feedback
      setTodayHabits((prev) =>
        prev.map((h) => {
          if (h.habit.id === item.habit.id) {
            return { ...h, completedToday: !h.completedToday };
          }
          return h;
        }),
      );
      // Refresh stats from backend
      loadStats();
      loadDailyProgress();

      // Fetch user progress for gamification
      const progressRes = await userApi.getProgress();
      if (progressRes.data?.success) {
        const newProgress = progressRes.data.data;
        if (user && newProgress.level > user.level) {
          // Level up!
          setLevelUpData({ open: true, level: newProgress.level });
        }
        updateUser(newProgress); // Update AuthContext
      }
    } catch (error) {
      console.error("Failed to toggle habit completion", error);
    }
  };

  // Calculate dynamic stats
  const completedCount = todayHabits.filter((h) => h.completedToday).length;
  const totalCount = todayHabits.length;
  const completionRate =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const statCards = [
    {
      label: "Today's Progress",
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
      label: "Completion Rate",
      value: stats ? `${stats.todayCompletionRate}%` : "-",
      isChart: true,
      chartValue: stats ? stats.todayCompletionRate : 0,
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
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ mb: 1 }}>
          Dashboard
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Welcome to HabitEngine
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

      {/* Stats Grid */}
      <Grid container spacing={2.5}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} sm={6} lg={3} key={stat.label}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    {stat.isChart ? (
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <PieChart width={44} height={44}>
                          <Pie
                            data={[
                              { value: stat.chartValue },
                              { value: 100 - stat.chartValue },
                            ]}
                            cx={20}
                            cy={20}
                            innerRadius={15}
                            outerRadius={20}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill={stat.color} />
                            <Cell fill={stat.bgColor} />
                          </Pie>
                        </PieChart>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: stat.bgColor,
                        }}
                      >
                        <Icon sx={{ color: stat.color, fontSize: "1.4rem" }} />
                      </Box>
                    )}
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, mb: 0.5, color: stat.color }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Daily Progress Chart Section */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h3">
            Progress ({chartFilter === 'daily' ? 'Last 7 Days' : chartFilter === 'weekly' ? 'Last 4 Weeks' : 'Last 6 Months'})
          </Typography>
          <ToggleButtonGroup
            value={chartFilter}
            exclusive
            onChange={(e, newVal) => { if(newVal) setChartFilter(newVal); }}
            size="small"
            sx={{ bgcolor: 'background.paper' }}
          >
            <ToggleButton value="daily">Daily</ToggleButton>
            <ToggleButton value="weekly">Weekly</ToggleButton>
            <ToggleButton value="monthly">Monthly</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Card elevation={0}>
          <CardContent sx={{ p: 4 }}>
            {loadingProgress ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={dailyProgress}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E5E7EB"
                    />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      allowDecimals={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value) => [value, "Completed Habits"]}
                      labelStyle={{
                        color: "#374151",
                        fontWeight: 600,
                        marginBottom: 4,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="completedCount"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
                      activeDot={{
                        r: 6,
                        fill: "#10B981",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Today's Habits Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Today&apos;s Habits
        </Typography>

        {loadingHabits ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : todayHabits.length === 0 ? (
          <Card elevation={0}>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 6,
              }}
            >
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                No habits to track today
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Head over to the Habits page to create one!
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {todayHabits.map((item) => (
              <Grid item xs={12} md={6} key={item.habit.id}>
                <Card
                  elevation={0}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 2,
                    borderLeft: `5px solid ${item.habit.category?.color || "#8B5CF6"}`,
                    opacity: item.completedToday ? 0.7 : 1,
                    transition: "all 0.2s",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        textDecoration: item.completedToday
                          ? "line-through"
                          : "none",
                        color: item.completedToday
                          ? "text.secondary"
                          : "text.primary",
                      }}
                    >
                      {item.habit.name}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      <CategoryIcon
                        sx={{
                          fontSize: "0.9rem",
                          color: item.habit.category?.color || "#8B5CF6",
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {item.habit.category?.name || "Uncategorized"}
                      </Typography>
                      {item.habit.streak?.currentStreak > 0 && (
                        <Chip
                          icon={
                            <FireIcon
                              sx={{ fontSize: "1rem", color: "#F59E0B" }}
                            />
                          }
                          label={`${item.habit.streak.currentStreak} Day Streak`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            bgcolor: "rgba(245, 158, 11, 0.1)",
                            color: "#F59E0B",
                            fontWeight: 600,
                            ml: 1,
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                  <IconButton
                    onClick={() => handleToggleCompletion(item)}
                    color={item.completedToday ? "success" : "default"}
                    sx={{ p: 1 }}
                  >
                    {item.completedToday ? (
                      <CheckCircleIcon sx={{ fontSize: "2rem" }} />
                    ) : (
                      <RadioButtonUncheckedIcon sx={{ fontSize: "2rem" }} />
                    )}
                  </IconButton>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Level Up Celebration Dialog */}
      <LevelUpCelebration
        open={levelUpData.open}
        level={levelUpData.level}
        onClose={() => setLevelUpData({ ...levelUpData, open: false })}
      />
    </Box>
  );
}
