const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const redis = require('redis');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/users');
const userCreated = require('./consumers/userCreated');
const userDelete = require('./consumers/userDelete');
const userEdit= require('./consumers/userEdit');

dotenv.config();


userCreated.consumer.on('ready', () => {
  console.log('Kafka consumer for userCreated is ready');
});

userCreated.consumer.on('connect', () => {
  console.log('Kafka consumer for userCreated connected');
});

userDelete.consumer.on('ready', () => {
  console.log('Kafka consumer for userDelete is ready');
});

userDelete.consumer.on('connect', () => {
  console.log('Kafka consumer for userDelete connected');
});

userEdit.consumer.on('ready', () => {
  console.log('Kafka consumer for userEdit is ready');
});

userEdit.consumer.on('connect', () => {
  console.log('Kafka consumer for userEdit connected');
});

const app = express();
const port = process.env.PORT || 3004;

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Users API',
      version: '1.0.0',
      description: 'API to read users from MongoDB',
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

app.use(cors());

app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

app.use('/users', userRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
