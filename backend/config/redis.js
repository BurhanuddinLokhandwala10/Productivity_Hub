const Redis = require("ioredis");

const redis = new Redis({
    host: "localhost",
    port: 6379,
    maxRetriesPerRequest: null,
});

redis.on("connect", () => {
    console.log("Redis Connected Successfully");
});

redis.on("error", (err) => {
    console.error("Redis Error:", err);
});

module.exports = redis;