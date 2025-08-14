// chat.controller.js
import Chat from "../models/chat.model.js";

// Create chat message
export const sendMessage = async (req, res) => {
    try {
        const { sender, receiver, message, messageType, booking } = req.body;

        const chatMessage = new Chat({
            sender,
            receiver,
            message,
            messageType: messageType || 'text',
            booking
        });

        await chatMessage.save();

        // Populate sender info for real-time response
        const populatedMessage = await Chat.findById(chatMessage._id)
            .populate('sender', 'name picture role')
            .populate('receiver', 'name picture role');

        res.status(201).json({
            message: "Message sent successfully",
            chat: populatedMessage
        });
    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get chat history
export const getChatHistory = async (req, res) => {
    try {
        const { userId, otherUserId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const messages = await Chat.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        })
        .populate('sender', 'name picture role')
        .populate('receiver', 'name picture role')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

        res.status(200).json({
            messages: messages.reverse(), // Reverse to show oldest first
            currentPage: page,
            hasMore: messages.length === limit
        });
    } catch (error) {
        console.error("Get Chat History Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Get user conversations
export const getUserConversations = async (req, res) => {
    try {
        const { userId } = req.params;

        // Get latest message for each conversation
        const conversations = await Chat.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { receiver: userId }]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$sender", userId] },
                            then: "$receiver",
                            else: "$sender"
                        }
                    },
                    lastMessage: { $first: "$message" },
                    lastMessageTime: { $first: "$createdAt" },
                    messageType: { $first: "$messageType" },
                    isRead: { $first: "$isRead" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "otherUser"
                }
            },
            {
                $unwind: "$otherUser"
            },
            {
                $project: {
                    otherUser: {
                        _id: 1,
                        name: 1,
                        picture: 1,
                        role: 1
                    },
                    lastMessage: 1,
                    lastMessageTime: 1,
                    messageType: 1,
                    isRead: 1
                }
            },
            {
                $sort: { lastMessageTime: -1 }
            }
        ]);

        res.status(200).json(conversations);
    } catch (error) {
        console.error("Get Conversations Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
    try {
        const { userId, otherUserId } = req.params;

        await Chat.updateMany(
            {
                sender: otherUserId,
                receiver: userId,
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );

        res.status(200).json({ message: "Messages marked as read" });
    } catch (error) {
        console.error("Mark Messages Read Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

