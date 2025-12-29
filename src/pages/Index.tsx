import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Shield, Brain } from "lucide-react";

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-calm-peach rounded-full opacity-30 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-calm-lavender rounded-full opacity-20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-calm-sage rounded-full opacity-20 blur-3xl animate-breathe" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="p-6 flex justify-between items-center max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-display font-semibold">CalmMind</span>
          </div>
          <Button onClick={() => navigate("/auth")} variant="outline">
            Sign In
          </Button>
        </header>

        {/* Hero */}
        <main className="px-6 py-16 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 animate-fade-in">
            Your companion for{" "}
            <span className="text-primary">calmer days</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "100ms" }}>
            Personalized habits, guided breathing, and instant support when anxiety hits. 
            Built with care for your mental wellness journey.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")} 
            className="gap-2 text-lg px-8 py-6 animate-fade-in shadow-warm"
            style={{ animationDelay: "200ms" }}
          >
            <Sparkles className="w-5 h-5" />
            Start Your Journey
          </Button>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            {[
              { icon: Brain, title: "AI-Powered Tasks", description: "Weekly habits personalized to your anxiety triggers and goals" },
              { icon: Shield, title: "Panic Mode", description: "Instant access to breathing exercises and calming techniques" },
              { icon: Heart, title: "Compassionate Support", description: "An AI companion that understands and supports you" },
            ].map((feature, i) => (
              <div 
                key={feature.title} 
                className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm shadow-soft animate-fade-in"
                style={{ animationDelay: `${300 + i * 100}ms` }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
