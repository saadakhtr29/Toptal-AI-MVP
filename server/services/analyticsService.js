const { Storage } = require("@google-cloud/storage");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AnalyticsService {
  constructor() {
    // Initialize storage only if credentials are available
    if (
      process.env.GOOGLE_CLOUD_PROJECT_ID &&
      process.env.GOOGLE_APPLICATION_CREDENTIALS
    ) {
      this.storage = new Storage({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });

      // Only initialize bucket if bucket name is provided
      if (process.env.GOOGLE_CLOUD_STORAGE_BUCKET) {
        this.bucket = this.storage.bucket(
          process.env.GOOGLE_CLOUD_STORAGE_BUCKET
        );
      }
    }
  }

  // Record call
  async recordCall(callId, audioStream) {
    try {
      // Check if storage is configured
      if (!this.storage || !this.bucket) {
        throw new Error("Google Cloud Storage is not configured");
      }

      const fileName = `calls/${callId}/${Date.now()}.wav`;
      const file = this.bucket.file(fileName);

      // Create write stream
      const writeStream = file.createWriteStream({
        metadata: {
          contentType: "audio/wav",
        },
      });

      // Pipe audio stream to storage
      audioStream.pipe(writeStream);

      // Return promise that resolves when upload is complete
      return new Promise((resolve, reject) => {
        writeStream.on("finish", async () => {
          try {
            // Update call record with recording URL
            await prisma.interaction.update({
              where: { id: callId },
              data: {
                recordingUrl: `https://storage.googleapis.com/${this.bucket.name}/${fileName}`,
              },
            });

            resolve({
              callId,
              recordingUrl: `https://storage.googleapis.com/${this.bucket.name}/${fileName}`,
            });
          } catch (error) {
            reject(error);
          }
        });

        writeStream.on("error", reject);
      });
    } catch (error) {
      console.error("Call Recording Error:", error);
      throw new Error("Failed to record call");
    }
  }

  // Track call metrics
  async trackCallMetrics(callId, metrics) {
    try {
      const { duration, status, transcription, sentiment, topics, keywords } =
        metrics;

      // Update call record with metrics
      await prisma.interaction.update({
        where: { id: callId },
        data: {
          duration,
          status,
          transcription,
          sentiment,
          topics,
          keywords,
          metrics: {
            duration,
            sentiment,
            topics,
            keywords,
          },
        },
      });

      return {
        callId,
        metrics: {
          duration,
          sentiment,
          topics,
          keywords,
        },
      };
    } catch (error) {
      console.error("Call Metrics Error:", error);
      throw new Error("Failed to track call metrics");
    }
  }

  // Get call analytics
  async getCallAnalytics(callId) {
    try {
      const call = await prisma.interaction.findUnique({
        where: { id: callId },
        include: {
          metrics: true,
        },
      });

      if (!call) {
        throw new Error("Call not found");
      }

      return {
        callId,
        recordingUrl: call.recordingUrl,
        duration: call.duration,
        status: call.status,
        transcription: call.transcription,
        sentiment: call.sentiment,
        topics: call.topics,
        keywords: call.keywords,
        metrics: call.metrics,
      };
    } catch (error) {
      console.error("Get Call Analytics Error:", error);
      throw new Error("Failed to get call analytics");
    }
  }

  // Get user analytics
  async getUserAnalytics(userId, timeRange = "30d") {
    try {
      const startDate = this.getStartDate(timeRange);

      const calls = await prisma.interaction.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          metrics: true,
        },
      });

      // Calculate aggregate metrics
      const analytics = {
        totalCalls: calls.length,
        totalDuration: calls.reduce(
          (sum, call) => sum + (call.duration || 0),
          0
        ),
        averageDuration: 0,
        averageSentiment: 0,
        topTopics: [],
        topKeywords: [],
        callStatusDistribution: {},
      };

      if (calls.length > 0) {
        // Calculate averages
        analytics.averageDuration = analytics.totalDuration / calls.length;
        analytics.averageSentiment =
          calls.reduce((sum, call) => sum + (call.sentiment || 0), 0) /
          calls.length;

        // Calculate topic and keyword frequencies
        const topicFreq = {};
        const keywordFreq = {};
        const statusFreq = {};

        calls.forEach((call) => {
          // Count topics
          if (call.topics) {
            call.topics.forEach((topic) => {
              topicFreq[topic] = (topicFreq[topic] || 0) + 1;
            });
          }

          // Count keywords
          if (call.keywords) {
            call.keywords.forEach((keyword) => {
              keywordFreq[keyword] = (keywordFreq[keyword] || 0) + 1;
            });
          }

          // Count status distribution
          statusFreq[call.status] = (statusFreq[call.status] || 0) + 1;
        });

        // Get top topics and keywords
        analytics.topTopics = Object.entries(topicFreq)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([topic]) => topic);

        analytics.topKeywords = Object.entries(keywordFreq)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([keyword]) => keyword);

        analytics.callStatusDistribution = statusFreq;
      }

      return analytics;
    } catch (error) {
      console.error("Get User Analytics Error:", error);
      throw new Error("Failed to get user analytics");
    }
  }

  // Get system analytics
  async getSystemAnalytics(timeRange = "30d") {
    try {
      const startDate = this.getStartDate(timeRange);

      const calls = await prisma.interaction.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          metrics: true,
        },
      });

      // Calculate system-wide metrics
      const analytics = {
        totalCalls: calls.length,
        totalDuration: calls.reduce(
          (sum, call) => sum + (call.duration || 0),
          0
        ),
        averageDuration: 0,
        averageSentiment: 0,
        topTopics: [],
        topKeywords: [],
        callStatusDistribution: {},
        userActivity: {},
      };

      if (calls.length > 0) {
        // Calculate averages
        analytics.averageDuration = analytics.totalDuration / calls.length;
        analytics.averageSentiment =
          calls.reduce((sum, call) => sum + (call.sentiment || 0), 0) /
          calls.length;

        // Calculate frequencies
        const topicFreq = {};
        const keywordFreq = {};
        const statusFreq = {};
        const userFreq = {};

        calls.forEach((call) => {
          // Count topics
          if (call.topics) {
            call.topics.forEach((topic) => {
              topicFreq[topic] = (topicFreq[topic] || 0) + 1;
            });
          }

          // Count keywords
          if (call.keywords) {
            call.keywords.forEach((keyword) => {
              keywordFreq[keyword] = (keywordFreq[keyword] || 0) + 1;
            });
          }

          // Count status distribution
          statusFreq[call.status] = (statusFreq[call.status] || 0) + 1;

          // Count user activity
          userFreq[call.userId] = (userFreq[call.userId] || 0) + 1;
        });

        // Get top topics and keywords
        analytics.topTopics = Object.entries(topicFreq)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([topic]) => topic);

        analytics.topKeywords = Object.entries(keywordFreq)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([keyword]) => keyword);

        analytics.callStatusDistribution = statusFreq;
        analytics.userActivity = userFreq;
      }

      return analytics;
    } catch (error) {
      console.error("Get System Analytics Error:", error);
      throw new Error("Failed to get system analytics");
    }
  }

  // Helper: Get start date based on time range
  getStartDate(timeRange) {
    const now = new Date();
    switch (timeRange) {
      case "7d":
        return new Date(now.setDate(now.getDate() - 7));
      case "30d":
        return new Date(now.setDate(now.getDate() - 30));
      case "90d":
        return new Date(now.setDate(now.getDate() - 90));
      case "1y":
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.setDate(now.getDate() - 30));
    }
  }
}

module.exports = new AnalyticsService();
