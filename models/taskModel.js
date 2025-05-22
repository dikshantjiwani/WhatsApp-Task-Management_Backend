const db = require('../db');

async function createTask({ task, assignee, due_time, notes }) {
  const result = await db.query(
    `INSERT INTO tasks (task, assignee, due_time, notes, status)
     VALUES ($1, $2, $3, $4, 'Pending') RETURNING *`,
    [task, assignee, due_time, notes]
  );
  return result.rows[0];
}

async function getAllTasks() {
  const result = await db.query('SELECT * FROM tasks ORDER BY created_at DESC');
  return result.rows;
}

async function getTasksByAssignee(assignee) {
  const result = await db.query('SELECT * FROM tasks WHERE assignee = $1', [assignee]);
  return result.rows;
}

async function markTaskDone(id) {
  const result = await db.query(
    'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
    ['Done', id]
  );
  return result.rows[0];
}

module.exports = { createTask, getAllTasks, getTasksByAssignee, markTaskDone };
