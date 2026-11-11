import {createClient} from "redis"

// create redis client

const redis = createClient({
  url : "redis://redis:6379"
})

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

redis.on("connect", () => {
  console.log("Redis connection established");
});

redis.on("ready", () => {
  console.log("Redis is ready to accept commands");
});

redis.connect();

export { redis }
