const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  senderName: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const TicketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['bug', 'feature', 'dev', 'others'], default: 'others' },
  status: { type: String, enum: ['open', 'pending', 'closed', 'in-progress', 'resolved'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  conversation: [ConversationSchema],
  attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

// Update updatedAt before saving
TicketSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Ticket', TicketSchema);
