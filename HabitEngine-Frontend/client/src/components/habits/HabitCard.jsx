import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import CategoryIcon from "@mui/icons-material/Folder";
import FireIcon from "@mui/icons-material/LocalFireDepartment";

/**
 * HabitCard component.
 * Renders a single habit with its category, description, status, and control actions.
 */
export default function HabitCard({ habit, onEdit, onDelete }) {
  const categoryColor = habit.category?.color || "#8B5CF6";
  const frequencyLabel = habit.frequency.toLowerCase();

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderLeft: `5px solid ${categoryColor}`,
        opacity: habit.isActive ? 1 : 0.7,
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Category & Status */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CategoryIcon sx={{ color: categoryColor, fontSize: "1rem" }} />
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, color: categoryColor }}
            >
              {habit.category?.name || "Uncategorized"}
            </Typography>
            {habit.streak?.currentStreak > 0 && (
              <Chip
                icon={<FireIcon sx={{ fontSize: '1rem', color: '#F59E0B' }} />}
                label={`${habit.streak.currentStreak} Day`}
                size="small"
                sx={{ 
                  height: 20, 
                  fontSize: '0.7rem',
                  bgcolor: 'rgba(245, 158, 11, 0.1)',
                  color: '#F59E0B',
                  fontWeight: 600,
                  ml: 1
                }}
              />
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Chip
              label={frequencyLabel}
              size="small"
              sx={{
                fontSize: "0.7rem",
                textTransform: "capitalize",
                height: 20,
                bgcolor: "background.default",
              }}
            />
            {!habit.isActive && (
              <Chip
                label="Paused"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ fontSize: "0.7rem", height: 20 }}
              />
            )}
          </Box>
        </Box>

        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 1,
            textDecoration: habit.isActive ? "none" : "line-through",
          }}
        >
          {habit.name}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 3,
            flexGrow: 1,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {habit.description || "No description provided."}
        </Typography>

        {/* Footer Meta & Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 1.5,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: "text.secondary",
            }}
          >
            <CalendarIcon sx={{ fontSize: "0.85rem" }} />
            <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
              Started {habit.startDate}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Edit Habit">
              <IconButton
                size="small"
                onClick={() => onEdit(habit)}
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "primary.main" },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Habit">
              <IconButton
                size="small"
                onClick={() => onDelete(habit.id)}
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "error.main" },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
