const Task = require('../models/taskModel');
const { sendWhatsAppMessage } = require('../services/whatsappService');

exports.handleIncomingMessage = async (req, res) => {
  try {
    const message = req.body?.message?.body?.trim();
    const senderPhone = req.body?.message?.from;

    if (message?.startsWith('DONE')) {
      const taskId = parseInt(message.split(' ')[1]);

      const task = await Task.markTaskDone(taskId);
      const confirmation = `✅ Task *${task.task}* has been marked as done.`;

      // Send confirmation to the sender
      await sendWhatsAppMessage(senderPhone, confirmation);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.sendStatus(500);
  }
};
