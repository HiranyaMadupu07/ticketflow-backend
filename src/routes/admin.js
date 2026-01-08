const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');
const { getAllTickets, assignTicket, getAnalytics, replyToTicket } = require('../controllers/adminController');

const router = express.Router();

router.use(auth, role('admin'));

router.get('/tickets', getAllTickets);
router.put('/tickets/:id/assign', assignTicket);
router.put('/tickets/:id/reply', [body('message').notEmpty()], validate, replyToTicket);
router.get('/analytics', getAnalytics);

module.exports = router;
