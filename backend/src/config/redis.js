const IORedis = require("ioredis");
const env = require("./env");

// BullMQ requires maxRetriesPerRequest: null on the connection it manages.
const connection = new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });

connection.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

module.exports = connection;
