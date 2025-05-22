const express = require('express');
const router = express.Router();
const { handleIncomingMessage } = require('../controllers/whatsappController');

router.post('/whatsapp-webhook', handleIncomingMessage);

module.exports = router;
