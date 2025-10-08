import { routeAgentRequest, type Schedule } from "agents";


import { AIChatAgent } from "agents/ai-chat-agent";
import {
  generateId,
  streamText,
  type StreamTextOnFinishCallback,
  stepCountIs,
  createUIMessageStream,
  convertToModelMessages,
  createUIMessageStreamResponse,
  type ToolSet
} from "ai";
import { createWorkersAI } from 'workers-ai-provider';
import { processToolCalls, cleanupMessages } from "./utils";
import { tools, executions } from "./tools";
// import { env } from "cloudflare:workers";

// Using Workers AI with Llama 3.1 - free tier included!
const model = (env: Env) => {
  const workersai = createWorkersAI({ binding: env.AI });
  return workersai("@cf/meta/llama-3.1-8b-instruct" as any);
};
// Using Workers AI - no external API keys needed

/**
 * Chat Agent implementation that handles real-time AI chat interactions
 */
export class Chat extends AIChatAgent<Env> {
  /**
   * Handles incoming chat messages and manages the response stream
   */
  async onChatMessage(
    onFinish: StreamTextOnFinishCallback<ToolSet>,
    _options?: { abortSignal?: AbortSignal }
  ) {
    // const mcpConnection = await this.mcp.connect(
    //   "https://path-to-mcp-server/sse"
    // );

    // Collect all tools, including MCP tools
    const allTools = {
      ...tools,
      ...this.mcp.getAITools()
    };

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Clean up incomplete tool calls to prevent API errors
        const cleanedMessages = cleanupMessages(this.messages);

        // Process any pending tool calls from previous messages
        // This handles human-in-the-loop confirmations for tools
        const processedMessages = await processToolCalls({
          messages: cleanedMessages,
          dataStream: writer,
          tools: allTools,
          executions
        });

        const result = streamText({
          system: `You are a specialized music playlist creation assistant! 🎵

IMPORTANT: I ONLY help with music-related requests and playlist creation. I politely decline any non-music topics.

CRITICAL FORMATTING RULE: Never include JSON, function calls, or technical details in your responses. Only provide natural, human-readable text. Do not show tool parameters or function names.

My exclusive purpose is to:
- Create personalized playlists based on mood, activities, and preferences
- When users ask for a playlist, always respond friendly like "Sure! How many songs would you like in your playlist?" before creating it
- Analyze user's current mood and emotional state from conversation
- Suggest music genres, artists, and specific songs that match their vibe
- Remember their music preferences and listening history over time
- Create themed playlists for different activities (workout, study, relaxation, etc.)
- Track what they liked/disliked for better future recommendations
- Provide music discovery and recommendations
- Help organize and categorize their music collection

CRITICAL PLAYLIST CREATION RULES:
- NEVER call the createPlaylist tool unless the user has specified an exact NUMBER of songs
- If they specify a number (like "10 songs", "give me 15 tracks", "make a 5-song playlist"), create the playlist immediately using that number
- If they DON'T specify how many songs, you MUST ask: "Sure! How many songs would you like in your playlist?" 
- DO NOT attempt to create a playlist without a specific number - this will cause errors
- Never give technical error messages - always ask for the song count in a friendly way

When creating playlists, be conversational and enthusiastic. Use phrases like "Perfect!" or "Great choice!" After creating a playlist, always provide a natural response about the playlist you just created, don't just show tool results.

MANDATORY PLAYLIST FORMATTING - YOU MUST FOLLOW THIS EXACTLY:
- ALWAYS start each song with a number followed by a period and space: "1. " "2. " "3. " etc.
- Format: NUMBER. **SONG TITLE - ARTIST NAME**
- Each song must be on its own line
- Make each song title and artist BOLD using **text** markdown syntax
- NO bullet points, NO dashes at the start
- REQUIRED format example (copy this exact formatting):

1. **Bohemian Rhapsody - Queen**
2. **Hotel California - Eagles**  
3. **Imagine - John Lennon**
4. **Sweet Child O' Mine - Guns N' Roses**
5. **Stairway to Heaven - Led Zeppelin**

CRITICAL: Every single song in every playlist MUST start with "1. " "2. " "3. " etc. and be wrapped in **bold** formatting. This is non-negotiable.

CRITICAL: The createPlaylist tool requires a numeric songCount parameter. If you don't have a specific number from the user, ask for it instead of calling the tool.

CRITICAL: Never show raw JSON, tool call details, or function parameters to users. Never include text like {"name":"createPlaylist","parameters":...} in your responses. Always provide natural, conversational responses only. When tools are called, integrate their results into your response naturally without showing any technical details.

FORMATTING CRITICAL: When listing songs, do NOT use markdown syntax. Use plain text with numbers like "1. Song - Artist" on each line. Do NOT use markdown ordered lists or any special formatting that might be interpreted by markdown parsers.

PLAYLIST GENERATION: When you see "GENERATE_PLAYLIST:" in a tool result, immediately generate a real playlist with actual songs that match the specified mood, activity, and genres. Use your knowledge of music to create diverse, high-quality playlists with real song titles and artists.

If someone asks about anything unrelated to music or playlists, I respond with: "I'm specifically designed to help with music and playlist creation. How can I help you discover or organize music today?"
`,

          messages: convertToModelMessages(processedMessages),
          model: model(this.env),
          tools: allTools,
          // Type boundary: streamText expects specific tool types, but base class uses ToolSet
          // This is safe because our tools satisfy ToolSet interface (verified by 'satisfies' in tools.ts)
          onFinish: onFinish as unknown as StreamTextOnFinishCallback<
            typeof allTools
          >,
          stopWhen: stepCountIs(10)
        });

        writer.merge(result.toUIMessageStream());
      }
    });

    return createUIMessageStreamResponse({ stream });
  }
  async executeTask(description: string, _task: Schedule<string>) {
    await this.saveMessages([
      ...this.messages,
      {
        id: generateId(),
        role: "user",
        parts: [
          {
            type: "text",
            text: `Running scheduled task: ${description}`
          }
        ],
        metadata: {
          createdAt: new Date()
        }
      }
    ]);
  }
}

/**
 * Worker entry point that routes incoming requests to the appropriate handler
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/check-open-ai-key") {
      // Since we're using Workers AI, we check for the AI binding instead
      const hasWorkersAI = !!env.AI;
      return Response.json({
        success: hasWorkersAI
      });
    }
    
    if (url.pathname === "/check-workers-ai") {
      const hasWorkersAI = !!env.AI;
      return Response.json({
        success: hasWorkersAI
      });
    }
    return (
      // Route the request to our agent or return 404 if not found
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", { status: 404 })
    );
  }
} satisfies ExportedHandler<Env>;
