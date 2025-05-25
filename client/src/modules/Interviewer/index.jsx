import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Alert } from "@mui/material";
import RoleSelector from "./RoleSelector";
import QuestionList from "./QuestionList";
import AnswerForm from "./AnswerForm";
import EvaluationDisplay from "./EvaluationDisplay";
import {
  generateQuestions,
  evaluateAnswers,
} from "../../services/interviewService";

const Interviewer = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [evaluation, setEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedRole) {
      generateQuestionsForRole();
    }
  }, [selectedRole]);

  const generateQuestionsForRole = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const generatedQuestions = await generateQuestions(selectedRole);
      setQuestions(generatedQuestions);
      setCurrentQuestion(0);
      setAnswers([]);
      setEvaluation(null);
    } catch (err) {
      setError("Failed to generate questions. Please try again.");
      console.error("Error generating questions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      await evaluateInterview(newAnswers);
    }
  };

  const evaluateInterview = async (allAnswers) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await evaluateAnswers(selectedRole, questions, allAnswers);
      setEvaluation(result);
    } catch (err) {
      setError("Failed to evaluate interview. Please try again.");
      console.error("Error evaluating interview:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      // TODO: Implement PDF report generation
      console.log("Downloading report...");
    } catch (err) {
      setError("Failed to generate report. Please try again.");
      console.error("Error generating report:", err);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          AI Interviewer
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <RoleSelector
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
        />

        <QuestionList
          questions={questions}
          currentQuestion={currentQuestion}
          isLoading={isLoading}
        />

        {questions.length > 0 && !evaluation && (
          <AnswerForm
            question={questions[currentQuestion]}
            onSubmit={handleAnswerSubmit}
            isLastQuestion={currentQuestion === questions.length - 1}
          />
        )}

        {evaluation && (
          <EvaluationDisplay
            evaluation={evaluation}
            isLoading={isLoading}
            onDownloadReport={handleDownloadReport}
          />
        )}
      </Box>
    </Container>
  );
};

export default Interviewer;
