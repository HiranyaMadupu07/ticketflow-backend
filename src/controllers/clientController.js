const Ticket = require('../models/Ticket');
const Attachment = require('../models/Attachment');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

exports.getTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.user.id })
      .populate('assignedTo', 'name email')
      .populate('attachments');
    res.json(tickets);
  } catch (err) {
    next(err);
  }
};

exports.createTicket = async (req, res, next) => {
  try {
    const { title, description, priority, category, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }

    // Create ticket first
    const ticket = new Ticket({
      title: title.trim(),
      description: description.trim(),
      priority: priority || 'medium',
      category: category || 'others',
      status: status || 'open',
      createdBy: req.user.id,
      attachments: []
    });
    await ticket.save();

    // Handle file uploads and create attachment records
    const attachmentIds = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const attachment = new Attachment({
          filename: file.originalname,
          url: `/uploads/${file.filename}`,
          mimeType: file.mimetype,
          size: file.size,
          uploadedBy: req.user.id,
          ticket: ticket._id
        });
        await attachment.save();
        attachmentIds.push(attachment._id);
      }

      // Update ticket with attachment references
      ticket.attachments = attachmentIds;
      await ticket.save();
    }

    await ticket.populate('createdBy', 'name email');
    await ticket.populate({
      path: 'attachments',
      model: 'Attachment'
    });
    res.status(201).json(ticket);
  } catch (err) {
    console.error('Error creating ticket:', err);
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

// Export the upload middleware
exports.upload = upload;
