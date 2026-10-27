import { Box, Typography } from "@mui/material";

/**
 * Consistent page title block: title, optional description, and right-aligned actions.
 */
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <Box
      sx={{
        mb: 4,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "flex-end" },
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>{actions}</Box>}
    </Box>
  );
}
