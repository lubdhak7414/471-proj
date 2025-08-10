// server.js
import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Connect to DB
connectDB();

// Routes
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
	res.send('Server is up and running!');
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
