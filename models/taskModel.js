const db = require('../db');

async function createTask({ task, assignee, due_time, notes, creator_phone, assignee_phone }) {
    const result = await db.query(
      `INSERT INTO tasks (task, assignee, due_time, notes, status, creator_phone, assignee_phone)
       VALUES ($1, $2, $3, $4, 'Pending', $5, $6)
       RETURNING *`,
      [task, assignee, due_time, notes, creator_phone, assignee_phone]
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
      `UPDATE tasks
       SET status = 'Done'
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

async function updateTaskDetails(id, updates) {
    const result = await db.query(
      `UPDATE tasks 
       SET status = COALESCE($2, status), notes = COALESCE($3, notes)
       WHERE id = $1
       RETURNING *`,
      [id, updates.status, updates.notes]
    );
    return result.rows[0];
  }

module.exports = { createTask, getAllTasks, getTasksByAssignee, markTaskDone, updateTaskDetails };
