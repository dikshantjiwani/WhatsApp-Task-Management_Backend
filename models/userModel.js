const db = require('../db');

async function getUserPhoneByName(name) {
  const result = await db.query(
    'SELECT phone FROM users WHERE LOWER(name) = LOWER($1)',
    [name]
  );
  return result.rows[0]?.phone || null;
}

module.exports = { getUserPhoneByName };