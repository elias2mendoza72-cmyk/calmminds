-- Create reminder preferences table
CREATE TABLE public.reminder_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  daily_mood_reminder BOOLEAN DEFAULT TRUE,
  weekly_task_reminder BOOLEAN DEFAULT TRUE,
  reminder_time TIME DEFAULT '09:00:00',
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.reminder_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.reminder_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.reminder_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.reminder_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_reminder_preferences_updated_at
  BEFORE UPDATE ON public.reminder_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();