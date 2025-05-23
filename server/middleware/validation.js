const Joi = require("joi");

class ValidationMiddleware {
  // Validate call initiation request
  validateCallInitiation(req, res, next) {
    const schema = Joi.object({
      to: Joi.string()
        .pattern(/^\+[1-9]\d{1,14}$/)
        .required(),
      context: Joi.object({
        role: Joi.string().required(),
        company: Joi.string().required(),
        position: Joi.string().required(),
        skills: Joi.array().items(Joi.string()).required(),
      }).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation Error",
        details: error.details.map((detail) => detail.message),
      });
    }

    next();
  }

  // Validate voice agent session request
  validateVoiceAgentSession(req, res, next) {
    const schema = Joi.object({
      context: Joi.object({
        role: Joi.string().required(),
        company: Joi.string().required(),
        position: Joi.string().required(),
        skills: Joi.array().items(Joi.string()).required(),
      }).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation Error",
        details: error.details.map((detail) => detail.message),
      });
    }

    next();
  }

  // Validate voice agent message
  validateVoiceAgentMessage(req, res, next) {
    const schema = Joi.object({
      message: Joi.string().required().min(1).max(1000),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation Error",
        details: error.details.map((detail) => detail.message),
      });
    }

    next();
  }

  // Validate interview question generation
  validateQuestionGeneration(req, res, next) {
    const schema = Joi.object({
      role: Joi.string().required(),
      level: Joi.string().valid("junior", "mid", "senior").required(),
      topics: Joi.array().items(Joi.string()).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation Error",
        details: error.details.map((detail) => detail.message),
      });
    }

    next();
  }

  // Validate interview evaluation
  validateInterviewEvaluation(req, res, next) {
    const schema = Joi.object({
      role: Joi.string().required(),
      questions: Joi.array().items(Joi.string()).required(),
      answers: Joi.array().items(Joi.string()).required(),
      criteria: Joi.object({
        technical: Joi.number().min(0).max(100).required(),
        communication: Joi.number().min(0).max(100).required(),
        problemSolving: Joi.number().min(0).max(100).required(),
      }).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation Error",
        details: error.details.map((detail) => detail.message),
      });
    }

    next();
  }

  // Validate WebSocket message
  validateWebSocketMessage(message) {
    const schema = Joi.object({
      type: Joi.string()
        .valid("subscribe", "unsubscribe", "message")
        .required(),
      room: Joi.string().when("type", {
        is: "message",
        then: Joi.string().optional(),
        otherwise: Joi.string().required(),
      }),
      data: Joi.object().when("type", {
        is: "message",
        then: Joi.object().required(),
        otherwise: Joi.object().optional(),
      }),
    });

    const { error } = schema.validate(message);
    return { error };
  }
}

module.exports = new ValidationMiddleware();
