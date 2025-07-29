const express = require('express');
const Group = require('../models/Group');
const GroupMessage = require('../models/GroupMessage');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create group
router.post('/create', auth, async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    // Create group
    const group = new Group({
      name,
      description: description || '',
      creator: req.user._id,
      members: [
        { user: req.user._id, role: 'admin' },
        ...(memberIds || []).map(id => ({ user: id, role: 'member' }))
      ]
    });

    await group.save();

    // Populate members info
    await group.populate('members.user', 'name email phone profilePicture');
    await group.populate('creator', 'name email phone profilePicture');

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's groups
router.get('/my-groups', auth, async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.user._id,
      isActive: true
    })
    .populate('members.user', 'name email phone profilePicture')
    .populate('creator', 'name email phone profilePicture')
    .sort({ updatedAt: -1 });

    res.json({ groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group details
router.get('/:groupId', auth, async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate('members.user', 'name email phone profilePicture')
      .populate('creator', 'name email phone profilePicture');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is member
    const isMember = group.members.some(member => 
      member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    res.json({ group });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add member to group
router.post('/:groupId/add-member', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    const userMember = group.members.find(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can add members' });
    }

    // Check if user to add exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    const isAlreadyMember = group.members.some(member => 
      member.user.toString() === userId
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Add user to group
    group.members.push({ user: userId, role: 'member' });
    await group.save();

    await group.populate('members.user', 'name email phone profilePicture');

    res.json({
      message: 'Member added successfully',
      group
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove member from group
router.post('/:groupId/remove-member', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    const userMember = group.members.find(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!userMember || userMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    // Remove user from group
    group.members = group.members.filter(member => 
      member.user.toString() !== userId
    );

    await group.save();

    await group.populate('members.user', 'name email phone profilePicture');

    res.json({
      message: 'Member removed successfully',
      group
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send group message
router.post('/:groupId/send-message', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, messageType = 'text' } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is member
    const isMember = group.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const message = new GroupMessage({
      group: groupId,
      sender: req.user._id,
      content,
      messageType
    });

    await message.save();

    await message.populate('sender', 'name profilePicture');

    res.status(201).json({
      message: 'Group message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send group message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group messages
router.get('/:groupId/messages', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is member
    const isMember = group.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const messages = await GroupMessage.find({ group: groupId })
      .sort({ createdAt: -1 })
      .limit(limit * page)
      .populate('sender', 'name profilePicture');

    res.json({
      messages: messages.reverse(),
      hasMore: messages.length === limit * page
    });
  } catch (error) {
    console.error('Get group messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave group
router.post('/:groupId/leave', auth, async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is member
    const userMember = group.members.find(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!userMember) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    // Remove user from group
    group.members = group.members.filter(member => 
      member.user.toString() !== req.user._id.toString()
    );

    // If no members left, delete group
    if (group.members.length === 0) {
      await group.remove();
      return res.json({ message: 'Group deleted as no members left' });
    }

    await group.save();

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 