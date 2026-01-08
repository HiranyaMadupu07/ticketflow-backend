const Ticket = require('../models/Ticket');

exports.getAllTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find().populate('createdBy', 'name email').populate('assignedTo', 'name email');
    res.json(tickets);
  } catch (err) {
    next(err);
  }
};

exports.assignTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assigneeId, status, priority } = req.body;
    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    if (assigneeId) ticket.assignedTo = assigneeId;
    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    
    await ticket.save();
    await ticket.populate('createdBy', 'name email');
    await ticket.populate('assignedTo', 'name email');
    
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

exports.replyToTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, senderName } = req.body;
    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    ticket.conversation.push({ 
      sender: req.user.id, 
      message, 
      senderName: senderName || req.user.name || 'Admin' 
    });
    await ticket.save();
    
    await ticket.populate('createdBy', 'name email');
    await ticket.populate('assignedTo', 'name email');
    
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const total = await Ticket.countDocuments();
    const byStatus = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byPriority = await Ticket.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    res.json({ total, byStatus, byPriority });
  } catch (err) {
    next(err);
  }
};
