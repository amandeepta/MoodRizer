const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const spotifyApi = require('./services/spotify');
const routes = require('./routes');
const socketHandlers = require('./sockets');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const {authRoutes} = require("./routes/authRoutes")
const port = process.env.PORT || 4000;

app.use(cors());
connectDB();

app.use(passport.initialize());
app.use(passport.session());
app.use('/', routes);
app.use('/auth', authRoutes);
app.use(express.json());
socketHandlers(io);

server.listen(port, () => console.log(`Server running on port ${port}`));
