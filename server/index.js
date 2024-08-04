const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('passport');
const session = require('express-session');
const socketHandler = require('./controllers/socket');
const access = require('./routes/getAccess');

const app = express();

app.use(session({ secret: 'secret', resave: false, saveUninitialized: true, cookie: { maxAge: 3600000 } }));
app.use(passport.initialize());
app.use(passport.session());

const auth = require('./routes/authRoutes');

const corsOptions = {
  origin: 'http://localhost:5173', // Replace with your front-end URL
  credentials: true, // Allow credentials (cookies, etc.)
};

app.use(cors(corsOptions));

connectDB();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'WebSocket'],
  },
});
app.use(express.json());
app.use('/auth', auth);
app.use('/access', access);
socketHandler(io);

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Server running on port ${port}`));