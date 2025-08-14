import express from "express";
import {
    sendMessage,
    getChatHistory,
    getUserConversations,
    markMessagesAsRead
} from "../controllers/chat.controller.js";

const router = express.Router();

// Send message
router.post("/", sendMessage);

// Get chat history between two users
router.get("/:userId/:otherUserId", getChatHistory);

// Get user conversations
router.get("/user/:userId/conversations", getUserConversations);

// Mark messages as read
router.put("/:userId/:otherUserId/read", markMessagesAsRead);

export default router;
