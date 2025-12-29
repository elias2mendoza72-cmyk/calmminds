import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, Bell, User, Mail, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReminderPreferences {
  daily_mood_reminder: boolean;
  weekly_task_reminder: boolean;
  reminder_time: string;
  email: string | null;
}

interface Profile {
  display_name: string | null;
}

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [preferences, setPreferences] = useState<ReminderPreferences>({
    daily_mood_reminder: true,
    weekly_task_reminder: true,
    reminder_time: "09:00",
    email: null,
  });
  const [testingSend, setTestingSend] = useState(false);

  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    setLoading(true);

    // Load profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      setDisplayName(profile.display_name || "");
    }

    // Load reminder preferences
    const { data: prefs } = await supabase
      .from("reminder_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (prefs) {
      setPreferences({
        daily_mood_reminder: prefs.daily_mood_reminder,
        weekly_task_reminder: prefs.weekly_task_reminder,
        reminder_time: prefs.reminder_time?.slice(0, 5) || "09:00",
        email: prefs.email || user.email || null,
      });
    } else {
      // Set default with user's email
      setPreferences((prev) => ({ ...prev, email: user.email || null }));
    }

    setLoading(false);
  };

  const saveSettings = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ display_name: displayName || null })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Upsert reminder preferences
      const { error: prefError } = await supabase
        .from("reminder_preferences")
        .upsert({
          user_id: user.id,
          daily_mood_reminder: preferences.daily_mood_reminder,
          weekly_task_reminder: preferences.weekly_task_reminder,
          reminder_time: preferences.reminder_time + ":00",
          email: preferences.email,
        });

      if (prefError) throw prefError;

      toast({
        title: "Settings saved!",
        description: "Your preferences have been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const sendTestReminder = async (type: "mood_reminder" | "weekly_review") => {
    if (!preferences.email) {
      toast({
        title: "No email set",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    setTestingSend(true);
    try {
      const response = await supabase.functions.invoke("send-reminder", {
        body: {
          type,
          userId: user?.id,
          email: preferences.email,
          userName: displayName,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Test email sent!",
        description: `Check ${preferences.email} for the test reminder.`,
      });
    } catch (error: any) {
      console.error("Error sending test:", error);
      toast({
        title: "Error",
        description: "Failed to send test email. Please check your Resend API key.",
        variant: "destructive",
      });
    } finally {
      setTestingSend(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-80 h-80 bg-calm-lavender rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-calm-sage rounded-full opacity-20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-semibold">Settings</h1>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Settings */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                This is your account email and cannot be changed here.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reminder Settings */}
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-primary" />
              Email Reminders
            </CardTitle>
            <CardDescription>
              Get gentle reminders to help you stay on track with your wellness journey.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reminderEmail">Reminder Email</Label>
              <div className="flex gap-2">
                <Mail className="w-5 h-5 text-muted-foreground mt-2" />
                <Input
                  id="reminderEmail"
                  type="email"
                  value={preferences.email || ""}
                  onChange={(e) =>
                    setPreferences({ ...preferences, email: e.target.value })
                  }
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Daily Mood Check-in</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a daily reminder to log your mood
                </p>
              </div>
              <Switch
                checked={preferences.daily_mood_reminder}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, daily_mood_reminder: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Task Review</Label>
                <p className="text-sm text-muted-foreground">
                  Get a weekly reminder to review your progress
                </p>
              </div>
              <Switch
                checked={preferences.weekly_task_reminder}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, weekly_task_reminder: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Preferred Time
              </Label>
              <Select
                value={preferences.reminder_time}
                onValueChange={(value) =>
                  setPreferences({ ...preferences, reminder_time: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["07:00", "08:00", "09:00", "10:00", "12:00", "18:00", "20:00", "21:00"].map(
                    (time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Note: Automated sending requires additional setup. Use test buttons below.
              </p>
            </div>

            {/* Test buttons */}
            <div className="border-t pt-4">
              <Label className="text-sm text-muted-foreground mb-3 block">
                Test your reminder emails:
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendTestReminder("mood_reminder")}
                  disabled={testingSend}
                >
                  {testingSend ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Send Mood Reminder
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendTestReminder("weekly_review")}
                  disabled={testingSend}
                >
                  {testingSend ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Send Weekly Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <Button onClick={saveSettings} disabled={saving} className="w-full gap-2" size="lg">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </Button>

        {/* Sign out */}
        <Button variant="outline" onClick={handleSignOut} className="w-full">
          Sign Out
        </Button>
      </main>
    </div>
  );
}
