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
