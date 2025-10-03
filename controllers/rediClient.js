require("dotenv").config();
const Redis = require("ioredis");

// Upstash Redis client
const client = new Redis(process.env.REDIS_URL, {
  tls: {},                 // TLS required by Upstash
  maxRetriesPerRequest: 5, // retry limit
});

// ✅ Only one-time connect log
client.once("connect", () => console.log("✅ Connected to Upstash Redis"));

// Error handling
client.on("error", (err) => console.error("❌ Redis connection error:", err));

module.exports = client;