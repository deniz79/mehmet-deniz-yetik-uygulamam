const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Search users by phone number
router.get('/search', auth, async (req, res) => {
  try {
    const { phone } = req.query;
    
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const user = await User.findOne({ phone }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    const isFriend = req.user.friends.includes(user._id);
    const hasSentRequest = req.user.sentFriendRequests.includes(user._id);
    const hasReceivedRequest = req.user.friendRequests.some(req => req.from.toString() === user._id.toString());

    res.json({ 
      user,
      isFriend,
      hasSentRequest,
      hasReceivedRequest
    });
  } catch (error) {
    console.error('Search user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send friend request
router.post('/send-friend-request', auth, async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: 'Receiver ID is required' });
    }

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    if (req.user.friends.includes(receiverId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if request already sent
    if (req.user.sentFriendRequests.includes(receiverId)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Check if request already received
    const hasReceivedRequest = receiver.friendRequests.some(req => req.from.toString() === req.user._id.toString());
    if (hasReceivedRequest) {
      return res.status(400).json({ message: 'Friend request already received from this user' });
    }

    // Add to sent requests
    req.user.sentFriendRequests.push(receiverId);
    await req.user.save();

    // Add to receiver's friend requests
    receiver.friendRequests.push({
      from: req.user._id,
      status: 'pending'
    });
    await receiver.save();

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept friend request
router.post('/accept-friend-request', auth, async (req, res) => {
  try {
    const { senderId } = req.body;

    if (!senderId) {
      return res.status(400).json({ message: 'Sender ID is required' });
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the friend request
    const friendRequest = req.user.friendRequests.find(
      request => request.from.toString() === senderId
    );

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Friend request already processed' });
    }

    // Update request status
    friendRequest.status = 'accepted';

    // Add to friends list for both users
    req.user.friends.push(senderId);
    sender.friends.push(req.user._id);

    // Remove from sent requests
    const senderIndex = sender.sentFriendRequests.indexOf(req.user._id);
    if (senderIndex > -1) {
      sender.sentFriendRequests.splice(senderIndex, 1);
    }

    await req.user.save();
    await sender.save();

    res.json({ 
      message: 'Friend request accepted successfully',
      sender: {
        _id: sender._id,
        name: sender.name,
        email: sender.email,
        phone: sender.phone,
        profilePicture: sender.profilePicture,
        isOnline: sender.isOnline
      }
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject friend request
router.post('/reject-friend-request', auth, async (req, res) => {
  try {
    const { senderId } = req.body;

    if (!senderId) {
      return res.status(400).json({ message: 'Sender ID is required' });
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find and remove the friend request
    const requestIndex = req.user.friendRequests.findIndex(
      request => request.from.toString() === senderId
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    req.user.friendRequests.splice(requestIndex, 1);

    // Remove from sent requests
    const senderIndex = sender.sentFriendRequests.indexOf(req.user._id);
    if (senderIndex > -1) {
      sender.sentFriendRequests.splice(senderIndex, 1);
    }

    await req.user.save();
    await sender.save();

    res.json({ message: 'Friend request rejected successfully' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get friends list
router.get('/friends/list', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'name email phone profilePicture isOnline')
      .populate('friendRequests.from', 'name email phone profilePicture isOnline')
      .populate('sentFriendRequests', 'name email phone profilePicture isOnline');

    res.json({
      friends: user.friends,
      friendRequests: user.friendRequests,
      sentRequests: user.sentFriendRequests
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 