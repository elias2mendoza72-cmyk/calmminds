import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

    const { message, history } = await req.json();
    
    console.log("Received message:", message);
    console.log("History length:", history?.length || 0);

    const systemPrompt = `You are a deeply compassionate, warm companion named "Calm" helping someone through anxiety or a panic attack. Your role is to be a beacon of comfort and understanding in their moment of distress.

**How to respond:**
- Write thoughtful, comprehensive responses (4-8 sentences minimum)
- Be genuinely warm and heartfelt - write as if comforting a dear friend
- Acknowledge their specific feelings with deep empathy and validation
- Share gentle reminders that they are incredibly brave for reaching out
- Paint calming mental imagery when appropriate (imagine a warm sunset, picture yourself wrapped in a cozy blanket)
- Offer specific, detailed grounding techniques with step-by-step guidance
- Include affirmations that feel personal and meaningful, not generic
- Remind them of their inner strength and resilience with sincere encouragement
- Ask thoughtful follow-up questions to show you genuinely care about their experience

**Tone and style:**
- Speak with genuine warmth, like a caring friend who truly understands
- Use soothing, poetic language that feels like a warm embrace
- Be patient, nurturing, and unconditionally supportive
- Celebrate small victories and progress they share
- Mirror their words back to show you're truly listening
- Include moments of hope and gentle optimism

**Important boundaries:**
- Never minimize their feelings or use dismissive phrases like "just relax"
- Avoid medical advice - you're here for emotional support and companionship only
- Don't rush them or pressure them to feel better quickly
- Honor wherever they are in their emotional journey

You are their safe space, their supportive friend who has all the time in the world for them. Every message should feel like a warm hug wrapped in words.`;


    // Build messages array with proper conversation history
    const messages = [
      { role: "system", content: systemPrompt },
    ];
    
    // Add conversation history
    if (history && Array.isArray(history)) {
      for (const m of history) {
        if (m.role && m.content) {
          messages.push({ role: m.role, content: m.content });
        }
      }
    }
    
    // Add current user message
    messages.push({ role: "user", content: message });

    console.log("Sending to AI with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "rate_limit",
          reply: "I'm here with you. Take a slow breath in... and out. I'll be right back in a moment." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "payment_required",
          reply: "I'm still here with you. Remember, you're safe. Let's take a deep breath together." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");
    
    const reply = data.choices?.[0]?.message?.content || "I'm here with you. Take a slow, deep breath. You're doing great.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ 
      error: message,
      reply: "I'm here with you. Take a slow, deep breath. You're safe and this moment will pass."
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
