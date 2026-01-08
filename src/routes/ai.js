const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { suggestResponse } = require('../controllers/aiController');

const router = express.Router();

// AI endpoints: protect as needed; allow admins and clients for suggestions
router.post('/suggest-response', auth, role(['admin','client']), suggestResponse);

module.exports = router;
