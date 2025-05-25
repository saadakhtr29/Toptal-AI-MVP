import React from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

const EvaluationDisplay = ({ evaluation, isLoading, onDownloadReport }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!evaluation) {
    return null;
  }

  return (
    <Box sx={{ my: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Interview Evaluation
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Overall Score
          </Typography>
          <Typography variant="h4" color="primary" gutterBottom>
            {evaluation.score}/10
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Strengths
          </Typography>
          <Typography variant="body1" paragraph>
            {evaluation.strengths}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Areas for Improvement
          </Typography>
          <Typography variant="body1" paragraph>
            {evaluation.improvements}
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Detailed Feedback
          </Typography>
          <Typography variant="body1" paragraph>
            {evaluation.feedback}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={onDownloadReport}
          >
            Download Report
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EvaluationDisplay;
