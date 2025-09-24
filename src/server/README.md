Minimal local server for sending verification emails.

Install:

1. cd src/server
2. npm install

Run:

- Dev: npx nodemon server.js
- Prod: node server.js

Configuration (.env):

Create a `.env` file in `src/server` with:

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
SMTP_FROM="Your App <no-reply@example.com>"
PORT=5000

If SMTP is not configured the server will return the verification code in the JSON response for development convenience.

Front-end integration:
- By default front-end calls `/api/send-code` relative to the app origin. When running the server on a different port, set `REACT_APP_API_URL=http://localhost:5000` in your React app .env.
