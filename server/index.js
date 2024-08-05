require('dotenv').config(); // Ensure to load environment variables
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session'); // Import express-session
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const socketHandler = require('./controllers/socket');
const access = require('./routes/getAccess');
const auth = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cookieParser());
app.use(session({
  secret: process.env.SECRET || 'your-default-secret', // Ensure a secret is provided
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));
app.use(passport.initialize());
app.use(passport.session());

// CORS options
const corsOptions = {
  origin: ['http://localhost:5173'], // Replace with your front-end URL
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'] // Allow credentials (cookies, etc.)
};

app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/auth', auth);
app.use('/access', access);

// Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'WebSocket'],
    credentials : true,
  },
});
socketHandler(io);

// Connect to the database
connectDB();

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Server running on port ${port}`));
