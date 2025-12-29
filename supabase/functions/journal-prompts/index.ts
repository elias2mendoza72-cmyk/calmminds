import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REFLECTION_PROMPTS = [
  "What's one thing that brought you comfort today?",
  "Describe a moment when you felt at peace recently.",
  "What are three things you're grateful for right now?",
  "How did your body feel during your last anxious moment?",
  "What would you tell a friend going through what you're experiencing?",
  "What's one small victory you can celebrate today?",
  "Describe a safe place, real or imagined, in detail.",
  "What patterns do you notice in your anxiety triggers?",
  "What coping strategy worked well for you recently?",
  "How have you grown in managing your anxiety this week?",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

    const { type, content } = await req.json();

    if (type === "random") {
      // Return a random reflection prompt
      const randomPrompt = REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)];
      return new Response(JSON.stringify({ prompt: randomPrompt }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "personalized" && content) {
      // Generate a personalized follow-up prompt based on journal content
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are a compassionate journaling companion. Based on what the user has written, generate a single thoughtful reflection question that:
- Encourages deeper self-exploration
- Is gentle and non-judgmental
- Helps them understand their feelings better
- Is specific to what they wrote about

Return ONLY the question, nothing else. Keep it under 30 words.`,
            },
            {
              role: "user",
              content: `Here's what I wrote in my journal:\n\n${content}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error("AI API error:", await response.text());
        throw new Error("AI API error");
      }

      const data = await response.json();
      const prompt = data.choices[0].message.content.trim();

      return new Response(JSON.stringify({ prompt }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid request type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
