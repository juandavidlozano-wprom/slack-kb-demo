# Slack KB Demo Bot Documentation

## Overview
This project is a proof-of-concept Slack bot that helps data engineering teams troubleshoot issues by searching a knowledge base (KB), summarizing solutions using OpenAI, and replying in Slack. The bot is designed for rapid, AI-powered support using markdown KB files stored in a GitHub repository.

---

## Features
- Slack slash command integration (e.g., `/kb`)
- Loads KB articles from a GitHub repo (markdown files)
- Uses OpenAI to summarize and suggest solutions
- Replies in Slack with formatted answers and code blocks
- Handles delayed responses for better UX
- Robust error handling and debug logging

---

## Architecture & Infrastructure
- **Slack App**: Set up in your Slack workspace with a slash command pointing to your bot’s public endpoint.
- **Express Server**: Node.js/Express app receives Slack requests and manages bot logic.
- **Ngrok**: Exposes your local Express server to the internet for Slack integration.
- **GitHub**: KB markdown files are stored in a GitHub repo and fetched via the GitHub API.
- **OpenAI**: Bot sends user questions and KB context to OpenAI for summarization and troubleshooting.
- **Environment Variables**: Sensitive keys (OpenAI, GitHub) and config are managed via `.env`.

---

## Technologies Used
- Node.js (v22+)
- Express
- body-parser
- dotenv
- openai (Node.js SDK)
- axios
- fs, path
- Ngrok
- Slack API
- GitHub API

---

## Installation & Setup
1. **Clone the Repo**
   ```bash
   git clone https://github.com/<your-org>/<your-repo>.git
   cd <your-repo>
   ```
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Create a Slack App**
   - Go to https://api.slack.com/apps and create a new app.
   - Add a slash command (e.g., `/kb`) pointing to your ngrok public URL (`https://xxxx.ngrok.io/slack/kb`).
   - Install the app in your workspace.
4. **Set Up Ngrok**
   ```bash
   ngrok http 4000
   ```
   - Copy the public URL for Slack slash command configuration.
5. **Create a GitHub Personal Access Token**
   - Go to https://github.com/settings/tokens and create a token with `repo` read permissions.
6. **Configure .env File**
   ```env
   OPENAI_API_KEY=your_openai_key
   OPENAI_MODEL=gpt-3.5-turbo
   GITHUB_TOKEN=your_github_token
   GITHUB_REPO=owner/repo
   KB_PATH=kb
   PORT=4000
   ```
7. **Start the Bot**
   ```bash
   node slackBot.js
   ```

---

## Data Example
The bot is designed to help troubleshoot issues like missing Google Ads spend data in BigQuery. Example table:

| client_id | spend | date                        |
|-----------|-------|-----------------------------|
| ABC       | 90.0  | 2025-10-08 00:00:00.000 UTC |
| ABC       | 110.0 | 2025-10-12 00:00:00.000 UTC |
| ...       | ...   | ...                         |
| XYZ       | 130.0 | 2025-10-14 00:00:00.000 UTC |

---

## Usage
- In Slack, type `/kb Why is client XYZ’s spend missing for October 10-12?`
- The bot will reply with a summary, troubleshooting steps, and relevant code blocks from the KB.

---

## How It Works
1. User sends a slash command in Slack.
2. Slack forwards the request to the Express server (via ngrok).
3. Bot replies immediately with a “searching” message.
4. Bot loads KB markdown files from GitHub using the API and your token.
5. Bot sends the user’s question and KB content to OpenAI.
6. OpenAI returns a summary and solution.
7. Bot formats code blocks and sends the final answer to Slack.
8. User sees the solution in Slack.

---

## Security Notes
- Keep your `.env` file secret and never commit it to GitHub.
- Use least-privilege tokens for GitHub and OpenAI.
- Ngrok exposes your local server; shut it down when not in use.

---

## Troubleshooting
- **Bot not responding:** Check ngrok is running and Slack slash command URL is correct.
- **KB not loading:** Verify GitHub token and repo path in `.env`.
- **OpenAI errors:** Check API key and model in `.env`.
- **Code blocks not formatted:** Ensure bot is running the latest code with improved formatting logic.

---

## References
- [Slack API Docs](https://api.slack.com/)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)
- [GitHub REST API](https://docs.github.com/en/rest)
- [Ngrok](https://ngrok.com/)

---

## Authors & Credits
- Project by juandavidlozano-wprom
- Built with help from GitHub Copilot

---

## License
MIT
