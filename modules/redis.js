const redis = require('redis');

// Create a Redis client instance
const redisClient = redis.createClient({
    host: 'localhost', // Redis server host
    port: 6379, // Redis server port
});

// Handle Redis client connection events
redisClient.on('connect', () => {
    console.log('Connected to Redis server');
});

redisClient.on('error', (err) => {
    console.error('Redis Error:', err);
});

module.exports = redisClient;