import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import apiRoutes from "./routes/index.js";
import cors from "cors";  // Import the cors package

dotenv.config();
console.log("Loaded PORT from .env:", process.env.PORT);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration: Allow localhost:5173
const corsOptions = {
  origin: "http://localhost:5173",  // Allow only localhost:5173
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Connect to DB
connectDB();

// API Routes
app.use("/api", apiRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
