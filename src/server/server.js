const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory code store (email -> code)
const codes = new Map();

// Create transporter if SMTP config is present
let transporter = null;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    } : undefined
  });
}

app.post('/api/send-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  codes.set(email, code);

  const text = `Votre code de vérification : ${code}`;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@example.com',
        to: email,
        subject: 'Code de vérification',
        text
      });
      return res.json({ ok: true });
    } catch (err) {
      console.error('Mail send error', err);
      // fallback to sending code in response
      return res.json({ ok: true, code, note: 'mail-failed' });
    }
  }

  // transporter not configured — return code in response for dev
  console.log(`Verification code for ${email}: ${code}`);
  return res.json({ ok: true, code, note: 'dev' });
});

app.post('/api/verify', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Missing fields' });
  const stored = codes.get(email);
  if (!stored) return res.status(404).json({ error: 'No code for email' });
  if (stored !== code) return res.status(400).json({ error: 'Invalid code' });
  codes.delete(email);
  return res.json({ ok: true });
});

const port = process.env.PORT || 5000;
app.listen(port, ()=> console.log('Server listening on', port));
