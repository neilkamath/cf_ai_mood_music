# Mood Music AI - Cloudflare AI Music Playlist Assistant

> **Forked from:** [Cloudflare Agents Starter Kit](https://github.com/cloudflare/agents-starter)  
> Original template for building AI-powered chat agents using Cloudflare's Agent platform.

A specialized music playlist creation assistant powered by Cloudflare Workers AI and Durable Objects. This AI chatbot helps users create personalized music playlists based on their mood, activities, and preferences using dynamic song generation.

## Features

- **Music-focused AI assistant** that creates personalized playlists based on mood, activity, and genre preferences
- **Dynamic song generation** using Cloudflare Workers AI (Llama 3.1) for real-time playlist creation
- **Interactive chat interface** with clean UI, dark/light themes, and real-time streaming responses
- **Persistent memory** that remembers conversation history and user preferences across sessions
- **Responsive design** that works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites

- **Node.js** (version 20.19+ or 22.12+ recommended)
- **Cloudflare account** (free tier works)
- **Git** for cloning the repository

### Running Locally

1. **Clone the repository**
```bash
   git clone <your-repo-url>
   cd cf_ai_mood_music
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .dev.vars.example .dev.vars
   
   # Edit .dev.vars if needed (Workers AI is configured by default)
   ```

4. **Authenticate with Cloudflare**
   ```bash
   npx wrangler login
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Start chatting with the AI about music!

### How to Use

1. **Ask for a playlist**: "I'm feeling sad, can you make me a playlist?"
2. **Specify song count**: "Make me a 10-song workout playlist"
3. **Include genres**: "Create a 5-song jazz playlist for studying"
4. **Set the mood**: "I need energetic music for my morning run"

**Example conversations:**
- "I'm feeling happy, make me a 8-song playlist"
- "Create a sad playlist with 5 songs"
- "I need workout music, 10 songs please"
- "Make me a chill study playlist with 6 songs"

## Requirements Compliance

This project meets the following technical requirements:

### **LLM (Large Language Model)**
- **Implementation**: Cloudflare Workers AI with Llama 3.1 8B Instruct
- **Model**: `@cf/meta/llama-3.1-8b-instruct`
- **Configuration**: Located in `src/server.ts`

### **Workflow / Coordination**
- **Implementation**: Cloudflare Durable Objects
- **Features**: 
  - Persistent state management with SQLite
  - Chat session coordination
  - Message history persistence
  - Real-time conversation handling
- **Configuration**: Defined in `wrangler.jsonc` with `Chat` class

### **User Input via Chat**
- **Implementation**: Cloudflare Pages with real-time chat interface
- **Features**:
  - Text-based chat input with `Textarea` component
  - Real-time message streaming via `useAgentChat`
  - Auto-resizing input field
  - Enter key submission
- **Configuration**: Pages configured with `assets: { directory: "public" }`

### **Memory or State**
- **Implementation**: Multi-layer state management
- **Features**:
  - **Durable Objects**: SQLite-based persistent storage
  - **Message History**: `saveMessages()` and `this.messages` for conversation persistence
  - **User Preferences**: Theme settings in localStorage
  - **Session Continuity**: State maintained across interactions
  - **Conversation Context**: AI references past messages and preferences

## Architecture

- **Frontend**: React with TypeScript, Vite build system
- **Backend**: Cloudflare Workers with Durable Objects
- **AI**: Cloudflare Workers AI (Llama 3.1 8B)
- **Storage**: SQLite (via Durable Objects)
- **Deployment**: Cloudflare Pages + Workers
- **Styling**: Tailwind CSS with dark/light theme support

## Deployment

### Deploy to Cloudflare

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare**
   ```bash
   npm run deploy
   ```

3. **Access your deployed app**
   - Your app will be available at `https://your-app-name.your-subdomain.workers.dev`
   - Or configure a custom domain in the Cloudflare dashboard

## Project Structure

```
cf_ai_mood_music/
├── src/
│   ├── app.tsx           # Main React chat interface
│   ├── server.ts         # Cloudflare Worker with AI agent logic
│   ├── tools.ts          # Music-specific AI tools (playlist creation, mood analysis)
│   ├── utils.ts          # Helper functions for message processing
│   ├── client.tsx        # Client-side entry point
│   ├── shared.ts         # Shared types and utilities
│   ├── styles.css        # Tailwind CSS styling
│   └── components/       # Reusable UI components
├── public/               # Static assets
├── wrangler.jsonc        # Cloudflare Workers configuration
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Music Tools

The AI uses three specialized tools for music functionality:

### `createPlaylist`
- Creates personalized playlists based on mood, activity, and genre preferences
- Requires user to specify song count (1-50)
- Generates real songs using AI knowledge

### `analyzeMood` 
- Analyzes user messages to detect emotional state
- Supports moods: sad, happy, angry, energetic, and more
- Returns confidence level for mood detection

### `getMusicRecommendations`
- Provides music recommendations based on user preferences
- Considers favorite artists, genres, and current mood
- Suggests songs, artists, and playlists

## Technical Details

### AI Model Configuration
- **Model**: Llama 3.1 8B Instruct (`@cf/meta/llama-3.1-8b-instruct`)
- **Platform**: Cloudflare Workers AI (free tier included)
- **Configuration**: Located in `src/server.ts`

### Durable Objects Setup
- **Class**: `Chat` extends `AIChatAgent`
- **Storage**: SQLite database for persistent state
- **Features**: Message history, user preferences, session continuity

### Environment Variables
- **Workers AI**: Automatically configured (no API keys needed)
- **Development**: Uses `.dev.vars` for local development
- **Production**: Deployed with Cloudflare Workers

### Development Notes
AI prompts used during development can be found in [PROMPTS.md](PROMPTS.md).

## License

This project is licensed under the MIT License - see the original [Cloudflare Agents Starter Kit](https://github.com/cloudflare/agents-starter) for details.

## Acknowledgments

- **Cloudflare** for the Workers AI platform and Agents framework
- **Original Template**: [Cloudflare Agents Starter Kit](https://github.com/cloudflare/agents-starter)
- **AI Model**: Meta's Llama 3.1 8B Instruct
