require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const socketHandler = require('./controllers/socket');
const access = require('./routes/getAccess');
const auth = require('./routes/authRoutes');
const app = express();

connectDB();

app.use(cookieParser());
app.set('trust proxy', 1); // Trust first proxy

const corsOptions = {
  origin: ['https://mood-rizer.vercel.app'], // Replace with your deployed frontend URL
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/auth', auth);
app.use('/access', access);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'https://mood-rizer.vercel.app', // Replace with your deployed frontend URL
    methods: ['GET', 'POST', 'WebSocket'],
    credentials: true,
  },
});
socketHandler(io);

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Server running on port ${port}`));
