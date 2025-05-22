const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.post('/tasks', taskController.createTask);
router.get('/tasks', taskController.getAllTasks);
router.get('/tasks/:assignee', taskController.getTasksByAssignee);
router.put('/tasks/done/:id', taskController.markTaskDone);

module.exports = router;
