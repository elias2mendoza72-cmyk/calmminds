import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2, Heart, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const QUICK_PROMPTS = [
  "I'm feeling anxious",
  "I can't calm down",
  "I'm scared",
  "Help me breathe",
];

export default function AIChatCompanion() {
  const [userName, setUserName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Speak text using Web Speech Synthesis
  const speakText = useCallback((text: string) => {
    if (!ttsEnabled || !("speechSynthesis" in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean text for speech (remove emojis)
    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9; // Slightly slower for calming effect
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a calming female voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.name.includes("Samantha") || v.name.includes("Google UK English Female") || v.name.includes("Microsoft Zira")
    ) || voices.find((v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female")) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // Toggle TTS
  const toggleTts = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setTtsEnabled((prev) => !prev);
    toast.info(ttsEnabled ? "Voice output disabled" : "Voice output enabled", { duration: 2000 });
  }, [isSpeaking, stopSpeaking, ttsEnabled]);

  // Load voices when available
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setInput(finalTranscript);
        } else if (interimTranscript) {
          setInput(interimTranscript);
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error("Voice input error. Please try again.");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info("Listening... speak now", { duration: 2000 });
      } catch (error) {
        console.error("Speech recognition error:", error);
        toast.error("Could not start voice input");
      }
    }
  }, [isListening]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();
        
        if (profile?.display_name) {
          setUserName(profile.display_name);
          setMessages([{
            role: "assistant",
            content: `Hi ${profile.display_name}! I'm so glad you're here. You're safe with me. Would you like to tell me what you're feeling right now? 💙`
          }]);
        } else {
          setMessages([{
            role: "assistant",
            content: "I'm here with you. You're safe. Would you like to tell me what you're feeling right now? 💙"
          }]);
        }
      } else {
        setMessages([{
          role: "assistant",
          content: "I'm here with you. You're safe. Would you like to tell me what you're feeling right now? 💙"
        }]);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessages([{
        role: "assistant",
        content: "I'm here with you. You're safe. Would you like to tell me what you're feeling right now? 💙"
      }]);
    }
  };

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
      
      // Send conversation history for context, include user name
      const response = await supabase.functions.invoke("panic-chat", {
        body: { 
          message: userMessage, 
          history: messages,
          userName: userName
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
        // Auto-speak the response if TTS is enabled
        speakText(data.reply);
      } else {
        throw new Error("No reply received");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const fallbackMessage = "I'm here with you. Take a slow, deep breath in... and out. You're doing great just by reaching out. What's on your mind?";
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: fallbackMessage 
      }]);
      speakText(fallbackMessage);
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
        
        {/* TTS Toggle */}
        <button
          onClick={toggleTts}
          className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors ${
            ttsEnabled 
              ? "bg-panic-accent/20 text-panic-accent" 
              : "bg-panic-accent/10 text-panic-text/50"
          }`}
        >
          {ttsEnabled ? (
            <>
              <Volume2 className="w-3 h-3" />
              Voice On {isSpeaking && <span className="animate-pulse">●</span>}
            </>
          ) : (
            <>
              <VolumeX className="w-3 h-3" />
              Voice Off
            </>
          )}
        </button>
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
              placeholder={isListening ? "Listening..." : "Type or speak how you're feeling..."}
              className="bg-panic-accent/10 border-panic-accent/30 text-panic-text placeholder:text-panic-text/40"
              disabled={loading}
            />
            {speechSupported && (
              <Button
                onClick={toggleListening}
                disabled={loading}
                size="icon"
                variant="outline"
                className={`border-panic-accent/30 ${
                  isListening 
                    ? "bg-red-500/20 text-red-400 border-red-400/50 animate-pulse" 
                    : "text-panic-text/70 hover:bg-panic-accent/10"
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            )}
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
