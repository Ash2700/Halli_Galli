const redis = require('redis')
const client = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: 16824
  }
})
client.on('error', (err) => console.log('Redis Client Error',err))
client.connect()
module.exports = client