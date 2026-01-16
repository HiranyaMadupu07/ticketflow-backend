const express = require('express');
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth');

const router = express.Router();

/* =========================
   CREATE TICKET
========================= */
router.post('/', auth, async (req, res) => {
  try {
    const ticket = await Ticket.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category || 'others',
      priority: req.body.priority || 'medium',
      status: req.body.status || 'open',
      createdBy: req.user.id,
    });

    // Populate createdBy to get user details
    await ticket.populate('createdBy', 'name email');
    
    res.status(201).json({ ticket });
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   GET USER TICKETS
   (Must come before /:id route)
========================= */
router.get('/user/:userId', auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const tickets = await Ticket.find({
      createdBy: req.user.id,
    })
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .populate('attachments')
    .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   GET SINGLE TICKET BY ID
========================= */
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('attachments');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user has access (either creator or admin)
    const createdById = ticket.createdBy._id ? ticket.createdBy._id.toString() : ticket.createdBy.toString();
    if (createdById !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
