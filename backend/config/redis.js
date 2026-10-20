const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null
});

redis.on("connect", () => {
    console.log("Redis Connected Successfully");
});

redis.on("error", (err) => {
    console.error("Redis Error:", err.message);
});

module.exports = redis;