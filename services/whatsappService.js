const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.WHAPI_BASE_URL; 
const TOKEN = process.env.WHAPI_TOKEN;

async function sendWhatsAppMessage(phoneNumber, message) {
  try {
    const res = await axios.post(
      `${BASE_URL}/messages/text`,
      {
        to: phoneNumber,
        body: message
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(` WhatsApp message sent to ${phoneNumber}`);
    return res.data;
  } catch (error) {
    console.error(` Error sending WhatsApp message to ${phoneNumber}:`, error.response?.data || error.message);
    throw error;
  }
}

module.exports = { sendWhatsAppMessage };
