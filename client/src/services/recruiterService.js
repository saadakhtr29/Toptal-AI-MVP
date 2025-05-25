import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

export const analyzeResume = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/recruiter/analyze`, data);
    return response.data;
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
};

export const findMatches = async (skills) => {
  try {
    const response = await axios.post(`${API_URL}/recruiter/matches`, {
      skills,
    });
    return response.data.matches;
  } catch (error) {
    console.error("Error finding matches:", error);
    throw error;
  }
};

export const generateMessage = async (candidateId) => {
  try {
    const response = await axios.post(
      `${API_URL}/recruiter/message/${candidateId}`
    );
    return response.data.message;
  } catch (error) {
    console.error("Error generating message:", error);
    throw error;
  }
};

export const sendMessage = async (candidateId, message) => {
  try {
    const response = await axios.post(
      `${API_URL}/recruiter/send/${candidateId}`,
      message
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
