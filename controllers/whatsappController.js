const Task = require('../models/taskModel');
const { sendWhatsAppMessage } = require('../services/whatsappService');

exports.handleIncomingMessage = async (req, res) => {
  try {
    const messageObj = req.body?.messages?.[0];
    const messageText = messageObj?.text?.body?.trim();
    const senderPhone = messageObj?.from;

    if (!messageText || !senderPhone) {
      return res.sendStatus(400);
    }

    // ✅ Handle DONE <taskId>
    if (messageText.toUpperCase().startsWith('DONE')) {
      const taskId = parseInt(messageText.split(' ')[1]);

      if (isNaN(taskId)) {
        await sendWhatsAppMessage(senderPhone, "❌ Invalid task ID. Use: DONE <id>");
        return res.sendStatus(200);
      }

      const task = await Task.markTaskDone(taskId);
      const confirmation = `✅ Task *${task.task}* marked as done.\nNotes: ${task.notes}`;
      await sendWhatsAppMessage(senderPhone, confirmation);
    }

    // ✅ Handle SHOW TASKS (all)
    else if (messageText.toUpperCase() === 'SHOW TASKS') {
      const tasks = await Task.getAllTasks();
      const formatted = tasks
        .filter(t => t.status !== 'Done')
        .map(t => `#${t.id}: ${t.task} → ${t.assignee} (Due: ${t.due_time || 'N/A'})`)
        .join('\n') || "🎉 No pending tasks!";
      await sendWhatsAppMessage(senderPhone, `📋 *Ongoing Tasks:*\n\n${formatted}`);
    }

    // ✅ Handle SHOW TASKS FOR <assignee>
    else if (messageText.toUpperCase().startsWith('SHOW TASKS FOR')) {
      const assignee = messageText.slice(15).trim();
      if (!assignee) {
        await sendWhatsAppMessage(senderPhone, "❌ Please specify an assignee. Example: SHOW TASKS FOR Dikshant");
        return res.sendStatus(200);
      }
      const tasks = await Task.getTasksByAssignee(assignee);
      const formatted = tasks
        .filter(t => t.status !== 'Done')
        .map(t => `#${t.id}: ${t.task} (Due: ${t.due_time || 'N/A'})`)
        .join('\n') || `🎉 No pending tasks for ${assignee}!`;
      await sendWhatsAppMessage(senderPhone, `📋 *Tasks for ${assignee}:*\n\n${formatted}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error in handleIncomingMessage:", err.message);
    res.sendStatus(500);
  }
};
