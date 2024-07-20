const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./config/db');
const socketHandlers = require('./controllers/socket');
require('./spotify');
const authRoutes = require("./routes/authRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 4000;

app.use(cors());
connectDB();
app.use(express.json());

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);

socketHandlers(io);

server.listen(port, () => console.log(`Server running on port ${port}`));
