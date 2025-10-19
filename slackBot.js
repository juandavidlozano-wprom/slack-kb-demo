// Basic Slack bot using Express
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint for Slack slash command
app.post('/slack/kb', (req, res) => {
  const { text, user_name } = req.body;
  // Respond with a simple confirmation
  res.json({
    response_type: 'in_channel',
    text: `Hi ${user_name}, you said: "${text}". Bot is working!`
  });
});

app.listen(PORT, () => {
  console.log(`Slack bot listening on port ${PORT}`);
});
