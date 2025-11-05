import express from 'express';
import { ENV } from './utils/env.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import { connectDB } from './utils/db.js';

const app = express();
const PORT = ENV.PORT || 8000;

// Public middlewares
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({limit: '10mb', extended: true }));
app.use(cookieParser());

// CORS configuration
if (ENV.NODE_ENV !== 'production') {
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:8080', ENV.CLIENT_URL],
    credentials: true,
  }));
} else {
  app.use(cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
  }));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

app.get('/', (req, res) => {
  res.send('someone is here...');
});

// Database connection and server start
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect DB:', err);
  });

// Serve frontend in production
if (ENV.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}
