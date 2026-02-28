require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const contestRoutes = require("./routes/contests");
const authRoutes = require("./routes/auth");
const deliverRoutes = require("./routes/deliver");

const app = express();
const PORT = process.env.PORT || 8000;

// Allow requests from the frontend dev server

var front_end_url = process.env.FRONTEND_URL || "http://localhost:3000"
app.use(cors({
  origin: front_end_url,
  credentials: true,
}));

app.use(express.json());

// Connect to MongoDB
connectDB();


// Routes
app.use("/api/contests", contestRoutes);  // GET /api/contests/fetch, GET /api/contests
app.use("/auth", authRoutes);             // POST /auth/google
app.use("/api/deliver", deliverRoutes);   // POST /api/deliver

app.get("/", (req, res) => {
  res.json({ status: `ok ${front_end_url}`, timestamp: new Date().toISOString() });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Auth endpoint    : POST http://localhost:${PORT}/auth/google`);
  console.log(`Deliver endpoint : POST http://localhost:${PORT}/api/deliver`);
});