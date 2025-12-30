import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Get user's questionnaire responses
    const { data: questionnaire } = await supabase
      .from("questionnaire_responses")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Get user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Get completed tasks from this week (use UTC to match frontend)
    const today = new Date();
    const dayOfWeek = today.getUTCDay(); // 0 = Sunday
    const weekStart = new Date(today);
    weekStart.setUTCDate(today.getUTCDate() - dayOfWeek);
    weekStart.setUTCHours(0, 0, 0, 0);
    
    const { data: existingTasks } = await supabase
      .from("weekly_tasks")
      .select("*")
      .eq("user_id", user.id)
      .gte("week_start", weekStart.toISOString().split("T")[0]);

    const completedTasks = existingTasks?.filter(t => t.is_completed).map(t => t.title) || [];

    // Build personalized prompt
    const triggers = questionnaire?.anxiety_triggers?.join(", ") || "general anxiety";
    const goals = questionnaire?.goals?.join(", ") || "manage anxiety";
    const sleepQuality = questionnaire?.sleep_quality || "unknown";
    const exerciseFreq = questionnaire?.exercise_frequency || "unknown";
    const socialSupport = questionnaire?.social_support || "unknown";
    const currentCoping = questionnaire?.current_coping || "";

    const systemPrompt = `You are a compassionate wellness coach specializing in anxiety management. Your role is to generate personalized, actionable weekly habit tasks that help people manage their anxiety.

Guidelines:
- Create 5-7 practical, achievable tasks for the week
- Tasks should be specific and measurable
- Mix different types: physical, mental, social, and self-care activities
- Consider the user's current lifestyle and support systems
- Avoid anything too overwhelming or unrealistic
- Use warm, encouraging language
- Focus on building sustainable habits, not quick fixes

User Profile:
- Anxiety triggers: ${triggers}
- Goals: ${goals}
- Sleep quality: ${sleepQuality}
- Exercise frequency: ${exerciseFreq}
- Social support level: ${socialSupport}
- Current coping methods: ${currentCoping || "Not specified"}
- Recently completed tasks: ${completedTasks.length > 0 ? completedTasks.join(", ") : "None yet"}

Generate tasks that address their specific triggers and support their goals while being realistic for their current lifestyle.

Return ONLY a JSON array of task objects with "title" and "description" fields. No other text.
Example format:
[{"title": "5-minute morning stretch", "description": "Start your day with gentle stretches to release tension and ground yourself in your body."}]`;

    console.log("Generating tasks for user:", user.id);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate my personalized weekly anxiety management tasks." },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Clean up the response - extract JSON from markdown if needed
    if (content.includes("```")) {
      content = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    }

    let tasks;
    try {
      tasks = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid AI response format");
    }

    // Save tasks to database
    const weekStartDate = weekStart.toISOString().split("T")[0];
    
    // Delete existing tasks for this week that aren't completed
    await supabase
      .from("weekly_tasks")
      .delete()
      .eq("user_id", user.id)
      .eq("week_start", weekStartDate)
      .eq("is_completed", false);

    // Insert new tasks
    const tasksToInsert = tasks.map((task: { title: string; description: string }) => ({
      user_id: user.id,
      title: task.title,
      description: task.description,
      week_start: weekStartDate,
    }));

    const { error: insertError } = await supabase
      .from("weekly_tasks")
      .insert(tasksToInsert);

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    console.log("Successfully generated", tasks.length, "tasks for user:", user.id);

    return new Response(JSON.stringify({ tasks, success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in generate-tasks function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
