import { NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

export async function GET() {
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  console.log("Environment check:");
  console.log("- Agent ID exists:", !!agentId);
  console.log("- API Key exists:", !!apiKey);
  console.log("- Agent ID value:", agentId);
  
  if (!agentId) {
    console.error("ELEVENLABS_AGENT_ID is not set");
    return NextResponse.json({ error: "ELEVENLABS_AGENT_ID is not set" }, { status: 500 });
  }
  
  if (!apiKey) {
    console.error("ELEVENLABS_API_KEY is not set");
    return NextResponse.json({ error: "ELEVENLABS_API_KEY is not set" }, { status: 500 });
  }
  
  try {
    console.log("Creating ElevenLabs client...");
    const client = new ElevenLabsClient({
      apiKey: apiKey,
    });
    
    console.log("Requesting signed URL for agent:", agentId);
    const response = await client.conversationalAi.getSignedUrl({
      agent_id: agentId,
    });
    
    console.log("Successfully got signed URL");
    return NextResponse.json({ signedUrl: response.signed_url });
  } catch (error) {
    console.error("Detailed error getting signed URL:", error);
    
    // More specific error handling
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      
      // Check for common ElevenLabs API errors
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: "Invalid API key. Please check your ELEVENLABS_API_KEY." },
          { status: 401 }
        );
      }
      
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        return NextResponse.json(
          { error: "Agent not found. Please check your ELEVENLABS_AGENT_ID and ensure the agent exists and is properly configured." },
          { status: 404 }
        );
      }
      
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        return NextResponse.json(
          { error: "Access forbidden. Please ensure your agent is properly configured with the required tools and settings." },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: "Failed to get signed URL", 
        details: error instanceof Error ? error.message : String(error),
        suggestion: "Please verify your agent is fully configured in the ElevenLabs dashboard with the system prompt, tools, and first message as described in the README."
      },
      { status: 500 }
    );
  }
}