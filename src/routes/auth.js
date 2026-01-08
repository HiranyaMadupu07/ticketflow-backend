const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { register, login, registerAdmin } = require('../controllers/authController');

const router = express.Router();

// Regular user registration - always creates 'client' role
router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], validate, register);

// Secure admin registration - requires ADMIN_SECRET_KEY
router.post('/register-admin', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('adminSecret').notEmpty().withMessage('Admin secret key is required')
], validate, registerAdmin);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], validate, login);

module.exports = router;
