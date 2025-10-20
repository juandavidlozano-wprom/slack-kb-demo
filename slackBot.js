// Basic Slack bot using Express
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs'); // still used for .env
const path = require('path'); // still used for .env
const axios = require('axios');
require('dotenv').config();
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({ extended: true }));

// Initialize OpenAI (v4+)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper to load all KB markdown files from local kb/ directory
function loadKBFiles() {
  const kbDir = path.join(__dirname, 'kb');
  let kbContent = '';
  if (fs.existsSync(kbDir)) {
    const files = fs.readdirSync(kbDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(kbDir, file), 'utf8');
      kbContent += `\n---\nFile: ${file}\n${content}`;
    }
  }
  return kbContent;
}

// Endpoint for Slack slash command



app.post('/slack/kb', async (req, res) => {
  const { text, user_name, response_url } = req.body;
  console.log(`[${new Date().toISOString()}] /slack/kb called by ${user_name} with text: ${text}`);
  // If the user is just testing, reply immediately
  if (text && text.trim().toLowerCase() === 'test') {
    console.log('Test command received, responding immediately.');
    return res.json({
      response_type: 'in_channel',
      text: `Hi ${user_name}, bot is working!`
    });
  }

  // Immediately respond with a 'thinking' message
  res.json({
    response_type: 'in_channel',
    text: ':mag: Searching knowledge base, please wait...'
  });

  // Continue with OpenAI/KB lookup in the background
  const kbContent = loadKBFiles();
  let aiResponse = 'Sorry, I could not process your request.';
  try {
    console.log('Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful support assistant for a data engineering team. Given a user problem and a knowledge base, suggest a summary, recommended steps, and reference relevant KB files. If the knowledge base contains any SQL or code blocks relevant to the user problem, always include them in your answer as a code block. If the knowledge base is not relevant to the user problem, or if there is no match, reply: "No relevant solution found in the knowledge base."' },
        { role: 'user', content: `User problem: ${text}\nKnowledge base:${kbContent}` }
      ],
      max_tokens: 400,
      temperature: 0.2,
    });
    aiResponse = completion.choices[0].message.content.trim();
    console.log('OpenAI API call complete.');
  } catch (err) {
    console.error('OpenAI error:', err.message);
    aiResponse = 'Error: Unable to get a response from OpenAI.';
  }


  // Improved: Only wrap true code blocks (indented by 4+ spaces or tab for 2+ lines) and leave triple backtick blocks as is
  function wrapCodeBlocks(text) {
    // 1. Leave existing triple backtick code blocks untouched
    // 2. Find indented code blocks (4+ spaces or tab at start, at least 2 lines)
    // 3. Wrap those blocks in triple backticks if not already
    // 4. Do not wrap single code-like lines
    let processed = text;
    // Regex for indented code blocks (4+ spaces or tab, at least 2 lines)
    const indentedBlock = /((?:^(?: {4,}|\t).+\n?){2,})/gm;
    // Don't double-wrap existing triple backtick blocks
    // For each indented block, if not already in triple backticks, wrap it
    processed = processed.replace(indentedBlock, (block) => {
      // If block is already inside triple backticks, skip
      if (/```[\s\S]*```/.test(block)) return block;
      // Remove leading/trailing newlines for clean wrapping
      const trimmed = block.replace(/^\n+|\n+$/g, '');
      return `\n\u0060\u0060\u0060\n${trimmed}\n\u0060\u0060\u0060\n`;
    });
    return processed;
  }

  const aiResponseWithCodeBlocks = wrapCodeBlocks(aiResponse);

  // Send the AI response to Slack using response_url
  if (response_url) {
    try {
      await axios.post(response_url, {
        response_type: 'in_channel',
        text: `Hi ${user_name}, here is a suggested solution:\n${aiResponseWithCodeBlocks}`
      });
      console.log('Posted AI response to Slack via response_url.');
    } catch (err) {
      console.error('Error posting to Slack response_url:', err.message);
    }
  } else {
    console.log('No response_url provided by Slack.');
  }
});


// Global error handlers for debugging
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
  console.log(`Slack bot listening on port ${PORT}`);
});
