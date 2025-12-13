import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HabitAnalysis {
  habit: string;
  actions: { number: number; task: string; frequency: string; estimatedMinutes: number }[];
  cue: string;
  implementation_intention: string;
  duration_days: number;
}

const systemPrompt = `You are ARISE AI, an expert behavioral science coach specializing in habit formation based on research by BJ Fogg, James Clear, and academic studies on automaticity.

When a user wants to build a habit:
1. Analyze what specific actions would build this habit
2. Create 5-8 numbered micro-actions that are specific, measurable, and progressively build the habit
3. Suggest an optimal cue (time-based or event-based trigger)
4. Create an implementation intention ("When X, I will Y")
5. Recommend schedule frequency (once or twice daily)
6. Consider the 66-day habit formation timeline

For habit analysis, respond in this EXACT JSON format:
{
  "type": "habit_analysis",
  "habit": "habit name",
  "actions": [
    {"number": 1, "task": "specific action", "frequency": "daily", "estimatedMinutes": 5},
    ...
  ],
  "cue": "after morning coffee",
  "implementation_intention": "When I finish my morning coffee, I will [action]",
  "duration_days": 60,
  "schedule_frequency": "once"
}

For general productivity questions, respond naturally as a helpful coach.

Key principles:
- Start small (2-minute rule)
- Anchor to existing routines
- Focus on consistency over intensity
- Celebrate small wins
- One missed day doesn't break the chain`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("AI Chat request received:", { type, messageCount: messages?.length });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please check your account." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I'm here to help! Tell me about the habit you want to build.";
    
    console.log("AI response received, length:", content.length);

    // Try to parse as JSON for habit analysis
    let parsedContent = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Not JSON, that's fine - it's a regular text response
    }

    return new Response(JSON.stringify({ 
      content,
      parsed: parsedContent 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI Chat error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "An error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});