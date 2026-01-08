const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  mimeType: { type: String },
  size: { type: Number },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attachment', AttachmentSchema);
