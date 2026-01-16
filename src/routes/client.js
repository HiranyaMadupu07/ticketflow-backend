const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');
const { getTickets, createTicket, replyToTicket, upload } = require('../controllers/clientController');

const router = express.Router();

router.use(auth, role('client'));

router.get('/tickets', getTickets);
router.post('/tickets', upload.array('attachments', 10), [body('title').notEmpty()], validate, createTicket);
router.put('/tickets/:id/reply', [body('message').notEmpty()], validate, replyToTicket);

module.exports = router;
