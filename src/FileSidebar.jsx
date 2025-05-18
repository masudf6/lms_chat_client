import React from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material"
import DescriptionIcon from "@mui/icons-material/Description"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"


function FileSidebar({ files, selectedFile, onSelectFile }) {
  return (
    <Box
      sx={{
        width: 260,
        bgcolor: "#f5f6fa",
        borderRight: "1px solid #e0e0e0",
        p: 2,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Course Files
      </Typography>
      <List dense>
        <ListItem
          button
          selected={selectedFile === ""}
          onClick={() => onSelectFile("")}
          sx={{ borderRadius: 1, mb: 0.5 }}
        >
          <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
          <ListItemText primary="All Files (Whole Corpus)" />
        </ListItem>
        <Divider sx={{ mb: 1 }} />
        {files.map((f) => (
          <ListItem
            key={f.name}
            button
            selected={selectedFile === f.name}
            onClick={() => onSelectFile(f.name)}
            sx={{ borderRadius: 1, mb: 0.5 }}
            secondaryAction={
              <Tooltip title="Open file in new tab">
                <IconButton
                  size="small"
                  href={f.sas_url}
                  target="_blank"
                  rel="noopener"
                  edge="end"
                  onClick={e => e.stopPropagation()}
                  sx={{ ml: 1 }}
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
          >
            <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
            <ListItemText
              primary={
                <Tooltip title={f.name}>
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{ maxWidth: 110, display: "inline-block" }}
                  >
                    {f.name}
                  </Typography>
                </Tooltip>
              }
              secondary={f.course ? `${f.course} / ${f.material_type}` : ""}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}

export default FileSidebar;
