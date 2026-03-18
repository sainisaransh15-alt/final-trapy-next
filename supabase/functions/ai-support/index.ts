// @ts-expect-error - Deno provides this module at runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Minimal Deno env typing for tooling
declare const Deno: {
  env: { get(key: string): string | undefined };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are Trapy Support, a helpful AI assistant for the Trapy carpooling platform in India. You help users with questions about booking rides, publishing rides, safety features, and general platform usage.

## About Trapy
Trapy is a carpooling platform that connects drivers and passengers for shared rides across India. It helps reduce travel costs, traffic congestion, and carbon emissions.

## Key Features to Know

### For Passengers:
- **Search & Book Rides**: Find rides by entering origin, destination, and date
- **Booking Process**: Select seats, choose pickup points, and confirm booking
- **Payment**: Pay the driver directly (cash or UPI) after the ride
- **Safety Features**: SOS button, trusted contacts, live ride tracking

### For Drivers:
- **Publish Rides**: Share your journey and earn money by offering seats
- **Set Your Price**: You decide the price per seat
- **Manage Bookings**: Approve or reject passenger requests
- **Recurring Rides**: Set up regular commute rides

### TrapyPass (Premium Subscription):
- Priority booking access
- Reduced platform fees
- Exclusive discounts
- Premium customer support

### Safety Features:
- **SOS Alert**: Emergency button to alert trusted contacts
- **Trusted Contacts**: Add emergency contacts who can track your ride
- **Live Tracking**: Share ride location with family/friends
- **Verified Profiles**: Aadhaar and DL verification for drivers

### Verification:
- Phone verification required for all users
- Aadhaar verification for identity
- Driving license verification for drivers

## Response Guidelines:
1. Be friendly, helpful, and concise
2. Use simple language (mix Hindi/English if appropriate)
3. Provide step-by-step instructions when needed
4. If you don't know something specific about user's account, suggest they check their dashboard
5. For urgent safety issues, recommend using the SOS feature or contacting local authorities
6. For payment disputes or serious issues, suggest contacting support at support@trapy.in

## Common Questions:
- How to book a ride: Go to Search, enter locations, select a ride, choose seats, and confirm
- How to publish a ride: Go to Publish, enter journey details, set price, and submit
- How to cancel booking: Go to Dashboard > My Bookings, find the ride, and cancel
- Refund policy: Refunds depend on cancellation timing (check the booking details)
- How to become verified: Go to Profile > Verification and upload required documents

Always be helpful and guide users through the platform. If something is beyond your knowledge, politely direct them to human support.`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
  const { messages } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transform OpenAI-style messages to Gemini content format
    const contents = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];

    let response: Response;
    try {
      response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=" + GEMINI_API_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.6,
              top_p: 0.8,
            },
          }),
        }
      );
    } catch (fetchError) {
      console.error("AI fetch error:", fetchError);
      return new Response(
        JSON.stringify({ error: "Upstream fetch failed", details: String(fetchError) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      if (response.status === 429) {
        // Return a helpful static response when rate limited
        const fallbackResponse = {
          choices: [{ 
            delta: { 
              content: "I'm currently experiencing high demand. For quick help:\n\n📱 **Book a Ride**: Go to Search → Enter locations → Select a ride\n🚗 **Publish a Ride**: Go to Publish → Enter journey details\n💬 **Contact Support**: support@trapy.in\n\nPlease try again in a few minutes!" 
            } 
          }]
        };
        const encoder = new TextEncoder();
        const fallbackStream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(fallbackResponse)}\n\n`));
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          }
        });
        return new Response(fallbackStream, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response", details: errorText, status: response.status }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transform Gemini response to OpenAI-compatible SSE format
    const geminiBody = response.body;
    if (!geminiBody) {
      return new Response(
        JSON.stringify({ error: "No response body from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Read the entire response and parse it
    const reader = geminiBody.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let fullResponse = "";
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullResponse += decoder.decode(value, { stream: true });
    }
    
    // Parse Gemini response and extract text
    let responseText = "";
    try {
      const jsonData = JSON.parse(fullResponse);
      
      // Handle array format from Gemini streaming
      if (Array.isArray(jsonData)) {
        for (const item of jsonData) {
          const text = item?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            responseText += text;
          }
        }
      } else {
        // Handle single object format
        const text = jsonData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          responseText = text;
        }
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError, fullResponse);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!responseText) {
      return new Response(
        JSON.stringify({ error: "Empty response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create SSE stream with the response
    const stream = new ReadableStream({
      start(controller) {
        const sseData = {
          choices: [{ delta: { content: responseText } }]
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(sseData)}\n\n`));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI support error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
