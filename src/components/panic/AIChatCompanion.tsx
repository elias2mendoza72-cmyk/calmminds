import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2, Heart } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "I'm feeling anxious",
  "I can't calm down",
  "I'm scared",
  "Help me breathe",
];

export default function AIChatCompanion() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "I'm here with you. You're safe. Would you like to tell me what you're feeling right now? 💙" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const userMessage = (messageText || input).trim();
    if (!userMessage || loading) return;

    setInput("");
    const newUserMessage: Message = { role: "user", content: userMessage };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Send conversation history for context
      const response = await supabase.functions.invoke("panic-chat", {
        body: { 
          message: userMessage, 
          history: messages // Send existing messages as history
        },
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
      });

      if (response.error) {
        console.error("Function error:", response.error);
        throw response.error;
      }

      const data = response.data;
      
      if (data.error === "rate_limit") {
        toast.info("Taking a moment... please try again shortly");
      }
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        throw new Error("No reply received");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm here with you. Take a slow, deep breath in... and out. You're doing great just by reaching out. What's on your mind?" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-panic-accent/20 rounded-full flex items-center justify-center mx-auto mb-2">
          <Heart className="w-6 h-6 text-panic-accent" />
        </div>
        <h2 className="text-xl font-display font-semibold">Calm Companion</h2>
        <p className="text-xs text-panic-text/50 mt-1">A supportive space to share how you're feeling</p>
      </div>

      <Card className="flex-1 bg-panic-accent/5 border-panic-accent/20 overflow-hidden">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
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
              <div className="flex justify-start animate-fade-in">
                <div className="bg-panic-accent/20 p-3 rounded-2xl flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-panic-text/70">Listening...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts - show only at start */}
          {messages.length === 1 && !loading && (
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full bg-panic-accent/10 text-panic-text/80 hover:bg-panic-accent/20 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Type how you're feeling..."
              className="bg-panic-accent/10 border-panic-accent/30 text-panic-text placeholder:text-panic-text/40"
              disabled={loading}
            />
            <Button
              onClick={() => sendMessage()}
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
