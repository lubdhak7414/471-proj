import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import apiRoutes from "./routes/index.js";
import cors from "cors";  // Import the cors package



//Intesar
import technicianRoutes from './routes/TechnicianRoutes.js'
import BookingRoutes from './routes/BookingRoutes.js'
import Message from './models/message.model.js';
import MessageRoute from './routes/MessageRoutes.js';

import {createServer} from 'http';
import {Server} from 'socket.io';




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
app.use('/api/technicians', technicianRoutes);
app.use('/api/techDashboard',BookingRoutes);
app.use('/api/messages',MessageRoute);
// Connect to DB
connectDB();

// API Routes
app.use("/api", apiRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

//intesar

const httpServer = createServer(app);
const io = new Server(httpServer,{
  cors:{
    origin:'http://localhost:5173',
    methods: ['GET','POST']
  }
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join conversation room
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation: ${conversationId}`);
  });

  // Send message
  socket.on('sendMessage', async (messageData) => {
    const { conversationId, sender, receiver, content } = messageData;
    
    // Save to database
    const newMessage = new Message({
      conversationId,
      sender,
      receiver,
      content,
    });
    await newMessage.save();
    
    // Emit to conversation room
    io.to(conversationId).emit('receiveMessage', newMessage);
  });

  // Leave conversation
  socket.on('leaveConversation', (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});


