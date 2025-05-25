import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  CircularProgress,
} from "@mui/material";

const QuestionList = ({ questions, currentQuestion, isLoading }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <Box sx={{ my: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No questions generated yet. Please select a role to begin.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h6" gutterBottom>
        Interview Questions
      </Typography>
      <Paper elevation={2}>
        <List>
          {questions.map((question, index) => (
            <ListItem
              key={index}
              sx={{
                bgcolor:
                  currentQuestion === index ? "action.selected" : "transparent",
                borderLeft:
                  currentQuestion === index ? "4px solid primary.main" : "none",
              }}
            >
              <ListItemText
                primary={`Question ${index + 1}`}
                secondary={question}
                primaryTypographyProps={{
                  fontWeight: currentQuestion === index ? "bold" : "normal",
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default QuestionList;
