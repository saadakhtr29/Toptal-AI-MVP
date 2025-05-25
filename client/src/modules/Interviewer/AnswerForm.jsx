import React, { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";

const AnswerForm = ({ question, onSubmit, isLastQuestion }) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(answer);
    setAnswer("");
  };

  if (!question) {
    return null;
  }

  return (
    <Box sx={{ my: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Answer
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!answer.trim()}
            >
              {isLastQuestion ? "Finish Interview" : "Next Question"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AnswerForm;
