import express from 'express';
import Message from '../models/message.model.js';
import mongoose from 'mongoose';
// import User from '../models/user.model.js'
const router = express.Router();


// Get all conversations for a user last message and unread count
router.get('/:userId/conversations', async (req, res) => {
  const { userId } = req.params;
// Validate userId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }
  try {
    const objectUserId = new mongoose.Types.ObjectId(userId);
    let conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: objectUserId },
            { receiver: objectUserId},
          ],
          // Ensure neither sender nor receiver is null
          sender: { $exists: true, $ne: null },
          receiver: { $exists: true, $ne: null }
        },
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$read", false] },
                    { $eq: ["$receiver", new mongoose.Types.ObjectId(userId)] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);
    // Additional check for null references
      conversations = conversations.filter(conv => 
        conv.lastMessage && 
        conv.lastMessage.sender && 
        conv.lastMessage.receiver
    );
    // Populate sender and receiver in lastMessage
    const populatedConversations= await Message.populate(conversations, {
      path: 'lastMessage.sender lastMessage.receiver',
      select: 'name picture',
      model: 'User'
    });

    // Sort conversations by last message timestamp descending
    populatedConversations.sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));

    res.json(populatedConversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.get('/:userId/:otherUserId', async (req, res) => {
  const { userId, otherUserId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    }).sort({ timestamp: 1 }).populate('sender receiver', 'name picture');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Delete all conversations for a user
router.delete('/:userId/conversations', async (req, res) => {
  const { userId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    await Message.deleteMany({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete all messages in a conversation
router.delete('/:userId/:otherUserId', async (req, res) => {
  const { userId, otherUserId } = req.params;
  
  // Validate user IDs
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(otherUserId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    await Message.deleteMany({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Mark messages as read for a conversation
router.put('/markRead/:userId/:otherUserId', async (req, res) => {
  const { userId, otherUserId } = req.params;
  try {
    await Message.updateMany({
      sender: otherUserId,
      receiver: userId,
      read: false,
    }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
