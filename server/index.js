require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const socketHandler = require('./controllers/socket');
const access = require('./routes/getAccess');
const auth = require('./routes/authRoutes');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const app = express();

connectDB();

const mongoStore = MongoStore.create({
  mongoUrl: process.env.DATABASE_URL,
  collectionName: 'sessions',
  ttl: 24 * 60 * 60,
});

app.use(cookieParser());
app.set('trust proxy', 1); // Trust first proxy

app.use(session({
  store: mongoStore,
  secret: process.env.SECRET || 'your-default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge : 24 * 60 * 60 * 1000, http : true, sameSite : 'None'}
}));

app.use(passport.initialize());
app.use(passport.session());

const corsOptions = {
  origin: ['https://mood-rizer.vercel.app'], // Replace with your deployed frontend URL
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
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
