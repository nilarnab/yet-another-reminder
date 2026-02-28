import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './db.js';
import contestRoutes from './routes/contests.js';
import authRoutes from './routes/auth.js';
import deliverRoutes from './routes/deliver.js';

const app = express();
const PORT = process.env.PORT || 8000;

const front_end_url = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({ origin: front_end_url }));
app.use(express.json());

app.use("/api/contests", contestRoutes);
app.use("/auth", authRoutes);
app.use("/api/deliver", deliverRoutes);

app.get("/", (req, res) => {
  res.json({ status: `ok ${front_end_url}`, timestamp: new Date().toISOString() });
});

async function startServer() {
  try {
    await connectDB();
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Auth endpoint    : POST http://localhost:${PORT}/auth/google`);
      console.log(`Deliver endpoint : POST http://localhost:${PORT}/api/deliver`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

// Call the async start function
startServer();