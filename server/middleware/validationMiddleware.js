const { ValidationError } = require("./errorHandler");

// Validate interview creation request
const validateInterviewCreation = (req, res, next) => {
  const { role, context } = req.body;

  if (!role) {
    throw new ValidationError("Role is required");
  }

  if (typeof role !== "string") {
    throw new ValidationError("Role must be a string");
  }

  if (context && typeof context !== "object") {
    throw new ValidationError("Context must be an object");
  }

  next();
};

// Validate answer submission request
const validateAnswerSubmission = (req, res, next) => {
  const { questionIndex, answer } = req.body;

  if (typeof questionIndex !== "number") {
    throw new ValidationError("Question index must be a number");
  }

  if (!answer) {
    throw new ValidationError("Answer is required");
  }

  if (typeof answer !== "string") {
    throw new ValidationError("Answer must be a string");
  }

  next();
};

// Validate call initiation request
const validateCallInitiation = (req, res, next) => {
  const { phoneNumber, context } = req.body;

  if (!phoneNumber) {
    throw new ValidationError("Phone number is required");
  }

  if (typeof phoneNumber !== "string") {
    throw new ValidationError("Phone number must be a string");
  }

  if (context && typeof context !== "object") {
    throw new ValidationError("Context must be an object");
  }

  next();
};

// Validate voice agent session request
const validateVoiceAgentSession = (req, res, next) => {
  const { context } = req.body;

  if (context && typeof context !== "object") {
    throw new ValidationError("Context must be an object");
  }

  next();
};

// Validate message submission request
const validateMessageSubmission = (req, res, next) => {
  const { message } = req.body;

  if (!message) {
    throw new ValidationError("Message is required");
  }

  if (typeof message !== "string") {
    throw new ValidationError("Message must be a string");
  }

  next();
};

// Validate resume upload request
const validateResumeUpload = (req, res, next) => {
  if (!req.file) {
    throw new ValidationError("Resume file is required");
  }

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedTypes.includes(req.file.mimetype)) {
    throw new ValidationError(
      "Invalid file type. Only PDF and Word documents are allowed"
    );
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (req.file.size > maxSize) {
    throw new ValidationError("File size exceeds 5MB limit");
  }

  next();
};

// Validate user registration request
const validateUserRegistration = (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email) {
    throw new ValidationError("Email is required");
  }

  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw new ValidationError("Invalid email format");
  }

  if (!password) {
    throw new ValidationError("Password is required");
  }

  if (password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters long");
  }

  if (!role) {
    throw new ValidationError("Role is required");
  }

  if (!["ADMIN", "RECRUITER"].includes(role)) {
    throw new ValidationError("Invalid role");
  }

  next();
};

// Validate subaccount creation request
const validateSubaccountCreation = (req, res, next) => {
  const { name, settings } = req.body;

  if (!name) {
    throw new ValidationError("Name is required");
  }

  if (typeof name !== "string") {
    throw new ValidationError("Name must be a string");
  }

  if (settings && typeof settings !== "object") {
    throw new ValidationError("Settings must be an object");
  }

  next();
};

module.exports = {
  validateInterviewCreation,
  validateAnswerSubmission,
  validateCallInitiation,
  validateVoiceAgentSession,
  validateMessageSubmission,
  validateResumeUpload,
  validateUserRegistration,
  validateSubaccountCreation,
};
