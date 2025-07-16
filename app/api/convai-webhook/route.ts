import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

export async function GET() {
  return NextResponse.json({ status: "booking webhook listening" }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const secret = process.env.ELEVENLABS_CONVAI_WEBHOOK_SECRET;
  const { event, error } = await constructWebhookEvent(req, secret);
  
  if (error) {
    return NextResponse.json({ error: error }, { status: 401 });
  }

  if (event.type === "post_call_transcription") {
    const { conversation_id, analysis, agent_id } = event.data;

    if (agent_id === process.env.ELEVENLABS_AGENT_ID) {
      console.log("Booking conversation completed:", {
        conversation_id,
        analysis,
      });
      
      // Extract booking data from the analysis
      const bookingData = {
        conversation_id,
        first_name: analysis?.first_name || null,
        last_name: analysis?.last_name || null,
        email: analysis?.email || null,
        booking_details: analysis?.booking_details || null,
        timestamp: new Date().toISOString(),
      };

      console.log("Booking data collected:", bookingData);
      
      // TODO: Send this data to n8n webhook or other booking system
      // Example:
      // await fetch('YOUR_N8N_WEBHOOK_URL', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(bookingData)
      // });
      
      // For now, just log the booking data
      console.log("Ready to send to n8n:", JSON.stringify(bookingData, null, 2));
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

const constructWebhookEvent = async (req: NextRequest, secret?: string) => {
  const body = await req.text();
  const signature_header = req.headers.get("ElevenLabs-Signature");

  if (!signature_header) {
    return { event: null, error: "Missing signature header" };
  }

  const headers = signature_header.split(",");
  const timestamp = headers.find(e => e.startsWith("t="))?.substring(2);
  const signature = headers.find(e => e.startsWith("v0="));

  if (!timestamp || !signature) {
    return { event: null, error: "Invalid signature format" };
  }

  // Validate timestamp
  const reqTimestamp = Number(timestamp) * 1000;
  const tolerance = Date.now() - 30 * 60 * 1000;
  if (reqTimestamp < tolerance) {
    return { event: null, error: "Request expired" };
  }

  // Validate hash
  const message = `${timestamp}.${body}`;

  if (!secret) {
    return { event: null, error: "Webhook secret not configured" };
  }

  const digest =
    "v0=" + crypto.createHmac("sha256", secret).update(message).digest("hex");

  if (signature !== digest) {
    return { event: null, error: "Invalid signature" };
  }

  const event = JSON.parse(body);
  return { event, error: null };
};