import { tool } from "ai";
import { z } from "zod";
import type { ToolSet } from "ai";

/**
 * Create a music playlist based on mood, activity, and preferences
 */
const createPlaylist = tool({
  description: "Create a personalized music playlist based on mood, activity, and music preferences",
  inputSchema: z.object({
    mood: z.string().describe("The user's current mood (e.g., happy, sad, energetic, calm, angry, romantic)"),
    activity: z.string().optional().describe("Activity the playlist is for (e.g., workout, study, relaxation, party, driving)"),
    genres: z.array(z.string()).optional().describe("Preferred music genres (e.g., rock, pop, hip-hop, electronic, jazz)"),
    playlistName: z.string().optional().describe("Custom name for the playlist"),
    songCount: z.number().describe("Number of songs to include in the playlist (1-50)")
  }),
  execute: async ({ mood, activity, genres, playlistName, songCount }) => {
    console.log(`Creating playlist: ${playlistName} with ${songCount} songs for ${mood} mood`);
    
    // Validate songCount
    if (typeof songCount !== 'number' || songCount < 1 || songCount > 50) {
      return "Please specify a valid number of songs between 1 and 50.";
    }
    
    // Generate playlist name if not provided
    const finalPlaylistName = playlistName || `${mood.charAt(0).toUpperCase() + mood.slice(1)} Vibes${activity ? ` for ${activity}` : ''}`;
    
    // Create text for genre and activity
    const activityText = activity ? ` perfect for ${activity}` : '';
    
    // Signal the main AI to generate a dynamic playlist
    return `PLAYLIST_REQUEST: Create a ${songCount}-song ${mood} playlist${activityText}. Name: ${finalPlaylistName}. Genres: ${genres?.join(', ') || 'various'}. Generate real songs that match this mood and activity.`;
  }
});

/**
 * Mood analysis tool
 * Analyzes user's mood from their message to suggest appropriate music
 */
const analyzeMood = tool({
  description: "Analyze the user's mood from their message to suggest appropriate music",
  inputSchema: z.object({
    userMessage: z.string().describe("The user's message to analyze for mood")
  }),
  execute: async ({ userMessage }) => {
    console.log(`Analyzing mood from message: ${userMessage}`);
    
    // Simple mood analysis based on keywords
    const message = userMessage.toLowerCase();
    
    let detectedMood = 'neutral';
    let confidence = 0.5;
    
    // Sad mood indicators
    if (message.includes('sad') || message.includes('depressed') || message.includes('down') || 
        message.includes('crying') || message.includes('heartbroken') || message.includes('lonely') ||
        message.includes('upset') || message.includes('blue') || message.includes('melancholy')) {
      detectedMood = 'sad';
      confidence = 0.8;
    }
    // Happy mood indicators
    else if (message.includes('happy') || message.includes('excited') || message.includes('great') ||
             message.includes('awesome') || message.includes('fantastic') || message.includes('wonderful') ||
             message.includes('amazing') || message.includes('cheerful') || message.includes('joyful')) {
      detectedMood = 'happy';
      confidence = 0.8;
    }
    // Angry mood indicators
    else if (message.includes('angry') || message.includes('mad') || message.includes('furious') ||
             message.includes('pissed') || message.includes('annoyed') || message.includes('frustrated') ||
             message.includes('rage') || message.includes('hate')) {
      detectedMood = 'angry';
      confidence = 0.8;
    }
    // Energetic mood indicators
    else if (message.includes('energetic') || message.includes('pumped') || message.includes('hyped') ||
             message.includes('workout') || message.includes('exercise') || message.includes('gym') ||
             message.includes('running') || message.includes('motivated')) {
      detectedMood = 'energetic';
      confidence = 0.8;
    }
    
    return `Detected mood: ${detectedMood} (${Math.round(confidence * 100)}% confidence). The function suggests creating a playlist that matches this mood.`;
  }
});

/**
 * Get music recommendations based on preferences
 */
const getMusicRecommendations = tool({
  description: "Get music recommendations based on user preferences and listening history",
  inputSchema: z.object({
    genres: z.array(z.string()).optional().describe("Preferred genres"),
    artists: z.array(z.string()).optional().describe("Favorite artists"),
    mood: z.string().optional().describe("Current mood"),
    excludeGenres: z.array(z.string()).optional().describe("Genres to avoid")
  }),
  execute: async ({ genres, artists, mood, excludeGenres }) => {
    console.log(`Getting recommendations for genres: ${genres}, artists: ${artists}, mood: ${mood}`);
    
    const recommendations = {
      songs: [
        "Based on your preferences, here are some recommendations:",
        "• Discover Weekly style suggestions",
        "• Similar artists to your favorites",
        "• New releases in your preferred genres",
        "• Hidden gems you might enjoy"
      ],
      artists: [
        "Artists you might like based on your taste",
        "Similar to your favorite artists",
        "Trending in your preferred genres"
      ],
      playlists: [
        "Curated playlists matching your style",
        "Genre-specific collections",
        "Mood-based playlists"
      ]
    };
    
    return `Music recommendations based on your preferences:
    
Songs: ${recommendations.songs.join('\n')}

Artists: ${recommendations.artists.join('\n')}

Playlists: ${recommendations.playlists.join('\n')}

${excludeGenres ? `Avoiding: ${excludeGenres.join(', ')}` : ''}`;
  }
});

/**
 * Tool definitions for the AI model
 * These will be provided to the AI model to describe available capabilities
 * Only music-related tools are included
 */
export const tools = {
  createPlaylist,
  analyzeMood,
  getMusicRecommendations
} satisfies ToolSet;

/**
 * Implementation of confirmation-required tools
 * This object contains the actual logic for tools that need human approval
 * Each function here corresponds to a tool above that doesn't have an execute function
 * Currently empty as all music tools execute automatically
 */
export const executions = {
  // No confirmation-required tools for music functionality
};
