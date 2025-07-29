const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Send message
router.post('/send', auth, async (req, res) => {
  try {
    const { recipientId, content, messageType = 'text' } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient ID and content are required' });
    }

    // Check if recipient exists and is a friend
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if they are friends
    if (!req.user.friends.includes(recipientId)) {
      return res.status(403).json({ message: 'You can only send messages to friends' });
    }

    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      content,
      messageType
    });

    await message.save();

    // Populate sender info for response
    await message.populate('sender', 'name profilePicture');

    // Send via socket for real-time
    const io = req.app.get('io');
    if (io) {
      const connectedUsers = io.connectedUsers;
      const recipientSocketId = connectedUsers.get(recipientId);
      if (recipientSocketId) {
        // Send the exact same format as database message
        io.to(recipientSocketId).emit('receive_message', {
          _id: message._id,
          sender: message.sender._id,
          recipient: message.recipient,
          content: message.content,
          messageType: message.messageType,
          createdAt: message.createdAt,
          isRead: message.isRead,
          updatedAt: message.updatedAt,
          __v: message.__v
        });
      }
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversation with a specific user
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if they are friends
    if (!req.user.friends.includes(userId)) {
      return res.status(403).json({ message: 'You can only view conversations with friends' });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ]
    })
    .sort({ createdAt: 1 }) // Sort by ascending order for proper display
    .limit(limit * page)
    .populate('sender', 'name profilePicture')
    .populate('recipient', 'name profilePicture');

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        recipient: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      messages: messages,
      hasMore: messages.length === limit * page
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all conversations (recent messages with each friend)
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = [];

    for (const friendId of req.user.friends) {
      const lastMessage = await Message.findOne({
        $or: [
          { sender: req.user._id, recipient: friendId },
          { sender: friendId, recipient: req.user._id }
        ]
      })
      .sort({ createdAt: -1 })
      .populate('sender', 'name profilePicture')
      .populate('recipient', 'name profilePicture');

      if (lastMessage) {
        const friend = await User.findById(friendId).select('name profilePicture isOnline lastSeen');
        conversations.push({
          friend,
          lastMessage,
          unreadCount: await Message.countDocuments({
            sender: friendId,
            recipient: req.user._id,
            isRead: false
          })
        });
      }
    }

    // Sort by last message time
    conversations.sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/mark-read/:senderId', auth, async (req, res) => {
  try {
    const { senderId } = req.params;

    await Message.updateMany(
      {
        sender: senderId,
        recipient: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender can delete their message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    await message.remove();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 