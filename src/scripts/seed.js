const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Attachment = require('../models/Attachment');
const AuditLog = require('../models/AuditLog');
const Team = require('../models/Team');
const bcrypt = require('bcryptjs');

async function seed() {
  await connectDB();

  try {
    const adminEmail = 'admin@example.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashed = await bcrypt.hash('adminpass', 10);
      admin = await User.create({ name: 'Admin', email: adminEmail, password: hashed, role: 'admin' });
      console.log('Created admin user');
    } else {
      console.log('Admin user exists');
    }

    const clientEmail = 'client@example.com';
    let client = await User.findOne({ email: clientEmail });
    if (!client) {
      const hashed = await bcrypt.hash('clientpass', 10);
      client = await User.create({ name: 'Client User', email: clientEmail, password: hashed, role: 'client' });
      console.log('Created client user');
    } else {
      console.log('Client user exists');
    }

    const ticketTitle = 'Sample ticket from seed';
    let ticket = await Ticket.findOne({ title: ticketTitle });
    if (!ticket) {
      ticket = await Ticket.create({
        title: ticketTitle,
        description: 'This is a seeded ticket for testing.',
        status: 'open',
        priority: 'medium',
        createdBy: client._id,
        assignedTo: admin._id,
        conversation: [
          { sender: admin._id, senderName: admin.name, message: 'Initial support reply from admin' }
        ]
      });
      console.log('Created sample ticket');
    } else {
      console.log('Sample ticket exists');
    }

    // create sample attachment
    let attachment = await Attachment.findOne({ filename: 'seed-file.txt' });
    if (!attachment) {
      await Attachment.create({
        filename: 'seed-file.txt',
        url: 'https://example.com/seed-file.txt',
        mimeType: 'text/plain',
        size: 1024,
        uploadedBy: client._id,
        ticket: ticket._id
      });
      console.log('Created sample attachment');
    } else {
      console.log('Sample attachment exists');
    }

    // create sample audit log
    let audit = await AuditLog.findOne({ action: 'seed:create' });
    if (!audit) {
      await AuditLog.create({
        action: 'seed:create',
        actor: admin._id,
        ticket: ticket._id,
        details: { note: 'Seed created sample ticket and users' }
      });
      console.log('Created sample audit log');
    } else {
      console.log('Sample audit log exists');
    }

    // create sample team
    let team = await Team.findOne({ name: 'Support Team' });
    if (!team) {
      await Team.create({ name: 'Support Team', description: 'Primary support team', members: [admin._id] });
      console.log('Created sample team');
    } else {
      console.log('Sample team exists');
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
