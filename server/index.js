require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const socketHandler = require('./controllers/socket');
const access = require('./routes/getAccess');
const auth = require('./routes/authRoutes');

const app = express();

app.use(cookieParser());
app.use(session({
  secret: process.env.SECRET || 'your-default-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());

const corsOptions = {
  origin: ['http://localhost:5173'],
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
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'WebSocket'],
    credentials: true,
  },
});
socketHandler(io);

connectDB();

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Server running on port ${port}`));
