import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Tooltip,
  Grid,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import statisticsApi from "../api/statisticsApi";
import dayjs from "dayjs";

export default function StatisticsPage() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const endDate = dayjs().format("YYYY-MM-DD");
        const heatmapStartDate = dayjs()
          .subtract(364, "day")
          .format("YYYY-MM-DD");
        const trendStartDate = dayjs()
          .subtract(12, "week")
          .format("YYYY-MM-DD");

        const [heatmapRes, trendRes] = await Promise.all([
          statisticsApi.getHeatmap(heatmapStartDate, endDate),
          statisticsApi.getTrends(trendStartDate, endDate),
        ]);

        if (heatmapRes?.success) setHeatmapData(heatmapRes.data);
        if (trendRes?.success) {
          // format trend dates for chart
          const formattedTrends = trendRes.data.map((t) => ({
            ...t,
            label: dayjs(t.startDate).format("MMM D"),
          }));
          setTrendData(formattedTrends);
        }
      } catch (error) {
        console.error("Failed to load statistics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getHeatmapColor = (count) => {
    if (count === 0) return "rgba(139, 92, 246, 0.05)";
    if (count === 1) return "rgba(139, 92, 246, 0.3)";
    if (count === 2) return "rgba(139, 92, 246, 0.6)";
    return "rgba(139, 92, 246, 1)"; // primary color
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" sx={{ mb: 0.5 }}>
          Statistics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track your progress with detailed analytics
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Heatmap Section */}
        <Grid size={12}>
          <Card elevation={0}>
            <CardContent sx={{ p: 4, overflowX: "auto" }}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Activity Heatmap (Last 365 Days)
              </Typography>

              <Box sx={{ display: "flex", gap: 1 }}>
                {/* Day Labels */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateRows: "repeat(7, 1fr)",
                    gap: "4px",
                    pr: 1,
                    py: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ height: 12, lineHeight: "12px" }}
                  ></Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ height: 12, lineHeight: "12px" }}
                  >
                    Mon
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ height: 12, lineHeight: "12px" }}
                  ></Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ height: 12, lineHeight: "12px" }}
                  >
                    Wed
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ height: 12, lineHeight: "12px" }}
                  ></Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ height: 12, lineHeight: "12px" }}
                  >
                    Fri
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ height: 12, lineHeight: "12px" }}
                  ></Typography>
                </Box>

                {/* Heatmap Grid */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateRows: "repeat(7, 1fr)",
                    gridAutoFlow: "column",
                    gap: "4px",
                    pb: 2,
                  }}
                >
                  {/* We need to offset the first column so it aligns with the correct day of week.
                      We can just render empty boxes for offset. */}
                  {heatmapData.length > 0 &&
                    Array.from({
                      length: dayjs(heatmapData[0].date).day(),
                    }).map((_, i) => (
                      <Box key={`empty-${i}`} sx={{ width: 12, height: 12 }} />
                    ))}

                  {heatmapData.map((day) => (
                    <Tooltip
                      key={day.date}
                      title={`${dayjs(day.date).format("MMM D, YYYY")}: ${day.completedCount} completions`}
                      arrow
                      placement="top"
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "2px",
                          bgcolor: getHeatmapColor(day.completedCount),
                          cursor: "pointer",
                          "&:hover": {
                            border: "1px solid #000",
                          },
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Trends Section */}
        <Grid size={12}>
          <Card elevation={0}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Completion Trends (Last 12 Weeks)
              </Typography>
              <Box sx={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={trendData}
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
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value) => [`${value}%`, "Completion Rate"]}
                      labelStyle={{
                        color: "#374151",
                        fontWeight: 600,
                        marginBottom: 4,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="completionRate"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#8B5CF6", strokeWidth: 0 }}
                      activeDot={{
                        r: 6,
                        fill: "#8B5CF6",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
