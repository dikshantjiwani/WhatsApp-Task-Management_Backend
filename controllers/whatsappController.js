const Task = require('../models/taskModel');
const User = require('../models/userModel');
const { sendWhatsAppMessage } = require('../services/whatsappService');

exports.handleIncomingMessage = async (req, res) => {
    try {
      const messageObj = req.body?.messages?.[0];
      const messageText = messageObj?.text?.body?.trim();
      const senderPhone = messageObj?.from;
      const senderName = messageObj?.from_name;
  
      if (!(senderPhone === '919999013016' || senderPhone === '917000565054')) {
        console.log(`Message from unauthorized number: ${senderPhone} — Ignored.`);
        return res.sendStatus(200);
      }
  
      console.log("Incoming:", messageText);
  
      // Handle DONE msg
      if (messageText.toUpperCase().startsWith('DONE')) {
        const taskId = parseInt(messageText.split(' ')[1]);
  
        if (isNaN(taskId)) {
          await sendWhatsAppMessage(senderPhone, "Invalid task ID. Use: DONE <task_id>");
          return res.sendStatus(200);
        }
  
        const task = await Task.markTaskDone(taskId);
  
        if (!task) {
          await sendWhatsAppMessage(senderPhone, `Task with ID ${taskId} not found.`);
          return res.sendStatus(200);
        }
  
        const confirmation = `Task *${task.task}* (ID: ${task.id}) has been marked as done.\n Notes: ${task.notes || 'N/A'}`;
  
        // Send confirmation to assignee
        await sendWhatsAppMessage(senderPhone, confirmation);
  
        // Send confirmation to task creator 
        if (task.creator_phone && task.creator_phone !== senderPhone) {
          await sendWhatsAppMessage(task.creator_phone, `📬 ${task.assignee} marked task *${task.task}* as done.\n ID: ${task.id}`);
        }
  
        return res.sendStatus(200); 
      }
  
      // Handle task creation message
      if (!messageText.includes(',')) {
        await sendWhatsAppMessage(senderPhone, " Invalid format. Use: <TASK>, <ASSIGNEE>, <OPTIONAL TIME>, <NOTES>");
        return res.sendStatus(200);
      }
  
      const parts = messageText.split(',').map(p => p.trim());
      if (parts.length < 3) {
        await sendWhatsAppMessage(senderPhone, " Please provide at least: task, assignee, and notes.");
        return res.sendStatus(200);
      }
  
      const [task, assigneeRaw, maybeTimeOrNotes, ...restNotes] = parts;
  
      let due_time = null;
      let notes = "";
      if (maybeTimeOrNotes.match(/\d{2}:\d{2}/)) {
        due_time = maybeTimeOrNotes;
        notes = restNotes.join(', ');
      } else {
        notes = [maybeTimeOrNotes, ...restNotes].join(', ');
      }
  
      const assignee = assigneeRaw;
  
      const assignee_phone = await User.getUserPhoneByName(assignee);
      if (!assignee_phone) {
        await sendWhatsAppMessage(senderPhone, ` Could not find user '${assignee}' in system.`);
        return res.sendStatus(200);
      }
  
      const createdTask = await Task.createTask({
        task,
        assignee,
        due_time: due_time || null,
        notes,
        creator_phone: senderPhone,
        assignee_phone
      });
  
      const message = `*New Task Assigned*\n\n Task: ${task}\n Assignee: ${assignee}\n Due: ${due_time || 'Not specified'}\n Notes: ${notes}\n\nReply *DONE ${createdTask.id}* to mark as done.`;
  
      await sendWhatsAppMessage(assignee_phone, message);
      await sendWhatsAppMessage(senderPhone, ` Task created and assigned to ${assignee}`);
  
      res.sendStatus(200);
    } catch (err) {
      console.error(" Webhook error:", err.message);
      res.status(500).json({ error: err.message });
    }
  };