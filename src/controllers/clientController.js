const Ticket = require('../models/Ticket');

exports.getTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.user.id }).populate('assignedTo', 'name email');
    res.json(tickets);
  } catch (err) {
    next(err);
  }
};

exports.createTicket = async (req, res, next) => {
  try {
    const { title, description, priority, category, status } = req.body;
    const ticket = new Ticket({ 
      title, 
      description, 
      priority: priority || 'medium',
      category: category || 'others',
      status: status || 'open',
      createdBy: req.user.id 
    });
    await ticket.save();
    await ticket.populate('createdBy', 'name email');
    res.status(201).json(ticket);
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
      senderName: senderName || req.user.name || '' 
    });
    await ticket.save();
    
    await ticket.populate('createdBy', 'name email');
    await ticket.populate('assignedTo', 'name email');
    
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};
