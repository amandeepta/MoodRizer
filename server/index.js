const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const socketHandler = require('./controllers/socket');
require('./spotify');
const authRoutes = require('./routes/authRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'WebSocket'],
  },
});
const port = process.env.PORT || 4000;

app.use(cors());
connectDB();
app.use(express.json());

app.use('/auth', authRoutes);

socketHandler(io);
server.listen(port, () => console.log(`Server running on port ${port}`));