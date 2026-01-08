/**
 * Script to create an admin user
 * 
 * Usage:
 *   node src/scripts/createAdmin.js <name> <email> <password> [adminSecret]
 * 
 * Or set environment variables:
 *   ADMIN_NAME=Admin ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=password node src/scripts/createAdmin.js
 */

require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  await connectDB();

  const name = process.env.ADMIN_NAME || process.argv[2];
  const email = process.env.ADMIN_EMAIL || process.argv[3];
  const password = process.env.ADMIN_PASSWORD || process.argv[4];
  const adminSecret = process.env.ADMIN_SECRET_KEY || process.argv[5];

  if (!name || !email || !password) {
    console.error('❌ Missing required parameters');
    console.log('\nUsage:');
    console.log('  node src/scripts/createAdmin.js <name> <email> <password>');
    console.log('\nOr use environment variables:');
    console.log('  ADMIN_NAME=Admin ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=password node src/scripts/createAdmin.js');
    process.exit(1);
  }

  // Verify admin secret if provided
  if (adminSecret && adminSecret !== process.env.ADMIN_SECRET_KEY) {
    console.error('❌ Invalid admin secret key');
    process.exit(1);
  }

  try {
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.role === 'admin') {
        console.log('✅ Admin user already exists:', email);
        process.exit(0);
      } else {
        // Upgrade existing user to admin
        existing.role = 'admin';
        await existing.save();
        console.log('✅ Existing user upgraded to admin:', email);
        process.exit(0);
      }
    }

    // Create new admin user
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    const admin = new User({
      name,
      email,
      password: hash,
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('   Name:', name);
    console.log('   Email:', email);
    console.log('   Role: admin');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
    process.exit(1);
  }
}

createAdmin();
