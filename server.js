const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const taskRoutes = require('./routes/taskRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const cron = require('node-cron');
const db = require('./db'); 
const { sendWhatsAppMessage } = require('./services/whatsappService');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api', taskRoutes);
app.use('/api', whatsappRoutes);

//cron job
cron.schedule('*/2 * * * *', async () => {
    const result = await db.query(`
      SELECT * FROM tasks
      WHERE status = 'Pending'
        AND due_time IS NOT NULL
        AND due_time >= NOW()
        AND due_time <= NOW() + INTERVAL '30 minutes'
    `);
  
    for (const task of result.rows) {
      const message = `Reminder: Task *${task.task}* is due at ${task.due_time}.
  Notes: ${task.notes || 'N/A'}
  Please reply "DONE ${task.id}" once completed.`;
  
      await sendWhatsAppMessage(task.assignee_phone, message);
      if (task.creator_phone && task.creator_phone !== task.assignee_phone) {
        await sendWhatsAppMessage(task.creator_phone, `Reminder sent to ${task.assignee} for task: ${task.task}`);
      }
    }
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
