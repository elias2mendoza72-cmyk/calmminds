import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2, Heart } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatCompanion() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "I'm here with you. You're safe. Would you like to tell me what you're feeling right now?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke("panic-chat", {
        body: { message: userMessage, history: messages },
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
      });

      if (response.error) throw response.error;

      setMessages(prev => [...prev, { role: "assistant", content: response.data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm here with you. Take a slow, deep breath. You're doing great just by reaching out." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-panic-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
          <Heart className="w-6 h-6 text-panic-accent" />
        </div>
        <h2 className="text-xl font-display font-semibold">Calm Companion</h2>
      </div>

      <Card className="flex-1 bg-panic-accent/5 border-panic-accent/20 overflow-hidden">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-panic-accent text-panic-bg"
                      : "bg-panic-accent/20 text-panic-text"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-panic-accent/20 p-3 rounded-2xl">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type how you're feeling..."
              className="bg-panic-accent/10 border-panic-accent/30 text-panic-text placeholder:text-panic-text/40"
            />
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              size="icon"
              className="bg-panic-accent text-panic-bg hover:bg-panic-accent/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
