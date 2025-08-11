// server.js
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/user.routes.js';
import bookingRoutes from "./routes/booking.routes.js";


dotenv.config();
console.log('Loaded PORT from .env:', process.env.PORT);


const app = express();
const PORT = process.env.PORT || 1966;

// Middleware to parse JSON
app.use(express.json());

// Connect to DB
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use("/api/bookings", bookingRoutes);

app.get('/', (req, res) => {
	res.send('Server is up and running!');
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
