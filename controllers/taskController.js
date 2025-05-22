const Task = require('../models/taskModel');
const { sendWhatsAppMessage } = require('../services/whatsappService');

exports.createTask = async (req, res) => {
  try {
    const task = await Task.createTask(req.body);

    const message = `📝 *New Task Assigned*\n\n📌 Task: ${task.task}\n👤 Assignee: ${task.assignee}\n📅 Due: ${task.due_time}\n🗒️ Notes: ${task.notes}\n\nReply *DONE ${task.id}* to mark as done.`;
    await sendWhatsAppMessage(req.body.assigneePhone, message); // assuming phone is passed

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.getAllTasks();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTasksByAssignee = async (req, res) => {
  try {
    const tasks = await Task.getTasksByAssignee(req.params.assignee);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markTaskDone = async (req, res) => {
  try {
    const task = await Task.markTaskDone(req.params.id);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTaskDetails = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { status, notes } = req.body;

    const task = await Task.updateTaskDetails(taskId, { status, notes });

    // Send WhatsApp messages to both assignee and creator
    const message = `🔔 Task *${task.task}* updated.\n📝 Notes: ${task.notes}\n✅ Status: ${task.status}`;
    await sendWhatsAppMessage(task.assigneePhone, message);
    await sendWhatsAppMessage(task.creatorPhone, message); // You may need to store creatorPhone

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

