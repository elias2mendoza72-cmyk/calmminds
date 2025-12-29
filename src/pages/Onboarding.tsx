import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, Loader2, Sparkles } from "lucide-react";

const ANXIETY_TRIGGERS = [
  { id: "work", label: "Work or career stress" },
  { id: "social", label: "Social situations" },
  { id: "health", label: "Health concerns" },
  { id: "finances", label: "Financial worries" },
  { id: "relationships", label: "Relationship issues" },
  { id: "future", label: "Uncertainty about the future" },
  { id: "past", label: "Past trauma or experiences" },
  { id: "daily", label: "Daily responsibilities" },
];

const GOALS = [
  { id: "sleep", label: "Better sleep" },
  { id: "calm", label: "Feel calmer daily" },
  { id: "focus", label: "Improved focus" },
  { id: "confidence", label: "More confidence" },
  { id: "relationships", label: "Healthier relationships" },
  { id: "attacks", label: "Manage panic attacks" },
  { id: "mindfulness", label: "Practice mindfulness" },
  { id: "habits", label: "Build healthy habits" },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [currentCoping, setCurrentCoping] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [sleepQuality, setSleepQuality] = useState("");
  const [exerciseFrequency, setExerciseFrequency] = useState("");
  const [socialSupport, setSocialSupport] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleTriggerToggle = (triggerId: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(triggerId)
        ? prev.filter((t) => t !== triggerId)
        : [...prev, triggerId]
    );
  };

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Save questionnaire responses
      const { error: questionnaireError } = await supabase
        .from("questionnaire_responses")
        .insert({
          user_id: user.id,
          anxiety_triggers: selectedTriggers,
          current_coping: currentCoping,
          goals: selectedGoals,
          sleep_quality: sleepQuality,
          exercise_frequency: exerciseFrequency,
          social_support: socialSupport,
        });

      if (questionnaireError) throw questionnaireError;

      // Update profile to mark onboarding complete
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast({
        title: "Welcome to CalmMind!",
        description: "Your personalized journey begins now.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedTriggers.length > 0;
      case 2:
        return true; // Optional
      case 3:
        return selectedGoals.length > 0;
      case 4:
        return sleepQuality && exerciseFrequency && socialSupport;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-72 h-72 bg-calm-sage rounded-full opacity-20 blur-3xl animate-float" />
        <div className="absolute bottom-10 left-20 w-64 h-64 bg-calm-peach rounded-full opacity-25 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of 4</span>
            <span className="text-sm text-muted-foreground">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Anxiety Triggers */}
        {step === 1 && (
          <Card className="border-0 shadow-warm animate-fade-in">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display">What triggers your anxiety?</CardTitle>
              <CardDescription>
                Select all that apply. This helps us personalize your experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ANXIETY_TRIGGERS.map((trigger) => (
                  <label
                    key={trigger.id}
                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedTriggers.includes(trigger.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Checkbox
                      checked={selectedTriggers.includes(trigger.id)}
                      onCheckedChange={() => handleTriggerToggle(trigger.id)}
                    />
                    <span className="text-sm font-medium">{trigger.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Current Coping */}
        {step === 2 && (
          <Card className="border-0 shadow-warm animate-fade-in">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display">How do you currently cope?</CardTitle>
              <CardDescription>
                Share what you've tried. There's no wrong answer here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="I usually try to... (e.g., take deep breaths, go for walks, talk to friends)"
                value={currentCoping}
                onChange={(e) => setCurrentCoping(e.target.value)}
                className="min-h-32 bg-background/50 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                This is optional, but helps us understand your starting point.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <Card className="border-0 shadow-warm animate-fade-in">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display">What are your goals?</CardTitle>
              <CardDescription>
                What would you like to achieve on this journey?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOALS.map((goal) => (
                  <label
                    key={goal.id}
                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedGoals.includes(goal.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Checkbox
                      checked={selectedGoals.includes(goal.id)}
                      onCheckedChange={() => handleGoalToggle(goal.id)}
                    />
                    <span className="text-sm font-medium">{goal.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Lifestyle */}
        {step === 4 && (
          <Card className="border-0 shadow-warm animate-fade-in">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display">A little about your lifestyle</CardTitle>
              <CardDescription>
                This helps us suggest habits that fit your life.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base">How would you rate your sleep quality?</Label>
                <RadioGroup value={sleepQuality} onValueChange={setSleepQuality}>
                  {["Poor", "Fair", "Good", "Excellent"].map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <RadioGroupItem value={option.toLowerCase()} />
                      <span>{option}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base">How often do you exercise?</Label>
                <RadioGroup value={exerciseFrequency} onValueChange={setExerciseFrequency}>
                  {["Rarely", "1-2 times/week", "3-4 times/week", "5+ times/week"].map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <RadioGroupItem value={option.toLowerCase().replace(/\s/g, "-")} />
                      <span>{option}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base">Do you have people you can talk to?</Label>
                <RadioGroup value={socialSupport} onValueChange={setSocialSupport}>
                  {["Not really", "Sometimes", "Yes, a few", "Yes, many"].map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <RadioGroupItem value={option.toLowerCase().replace(/\s/g, "-")} />
                      <span>{option}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed() || loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Start My Journey
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
