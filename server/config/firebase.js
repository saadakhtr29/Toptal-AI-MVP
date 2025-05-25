const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin
const serviceAccount = require("./toptal-midoffice-ai-firebase-adminsdk-fbsvc-748e233d75.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

// Export the admin instance
module.exports = admin;
