import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, userId, email, userName } = await req.json();

    let subject = "";
    let html = "";

    if (type === "mood_reminder") {
      subject = "🌿 CalmMind: How are you feeling today?";
      html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #faf8f5;">
          <div style="background: linear-gradient(135deg, #f5ebe0 0%, #e8ddd4 100%); border-radius: 16px; padding: 32px; text-align: center;">
            <h1 style="color: #8b5e3c; margin: 0 0 16px 0; font-size: 24px;">Good morning${userName ? `, ${userName}` : ''}! 🌅</h1>
            <p style="color: #6b5344; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              Taking a moment to check in with yourself is a powerful step in your wellness journey. 
              How are you feeling today?
            </p>
            <a href="https://50840b59-ae2f-489a-8b7d-992e7603aaf5.lovableproject.com/dashboard" 
               style="display: inline-block; background-color: #c27c5c; color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 16px;">
              Log My Mood 😊
            </a>
            <p style="color: #9b8578; font-size: 14px; margin-top: 24px;">
              Remember: Every check-in brings you closer to understanding yourself better.
            </p>
          </div>
          <p style="color: #9b8578; font-size: 12px; text-align: center; margin-top: 24px;">
            You're receiving this because you enabled daily mood reminders in CalmMind.
            <br>Visit your settings to change your preferences.
          </p>
        </div>
      `;
    } else if (type === "weekly_review") {
      subject = "📋 CalmMind: Your Weekly Task Review";
      html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #faf8f5;">
          <div style="background: linear-gradient(135deg, #e8f0e8 0%, #d4e4d4 100%); border-radius: 16px; padding: 32px; text-align: center;">
            <h1 style="color: #4a6741; margin: 0 0 16px 0; font-size: 24px;">Weekly Check-in Time! 🌿</h1>
            <p style="color: #5a7a52; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              It's time to reflect on your week and see how your anxiety management habits are going.
              Celebrate your wins and plan for the week ahead!
            </p>
            <a href="https://50840b59-ae2f-489a-8b7d-992e7603aaf5.lovableproject.com/dashboard" 
               style="display: inline-block; background-color: #5a8a52; color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 16px;">
              View My Progress ✨
            </a>
            <p style="color: #7a9a72; font-size: 14px; margin-top: 24px;">
              Tip: If you've completed most of your tasks, consider generating new ones!
            </p>
          </div>
          <p style="color: #9b8578; font-size: 12px; text-align: center; margin-top: 24px;">
            You're receiving this because you enabled weekly reminders in CalmMind.
            <br>Visit your settings to change your preferences.
          </p>
        </div>
      `;
    } else {
      throw new Error("Invalid reminder type");
    }

    console.log(`Sending ${type} email to ${email}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CalmMind <onboarding@resend.dev>",
        to: [email],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend error:", errorText);
      throw new Error(`Resend API error: ${res.status}`);
    }

    const emailResponse = await res.json();
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending reminder:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
