-- Create user_activity table to track student progress
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('quiz', 'flashcard', 'note', 'practice', 'recall', 'test')),
  subject_id UUID REFERENCES subjects(id),
  topic_id UUID REFERENCES topics(id),
  subtopic_id UUID REFERENCES subtopics(id),
  score INTEGER, -- 0-100 for quizzes, null for views
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);

-- Enable Row Level Security
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own activity
CREATE POLICY "Users can view own activity" ON user_activity
  FOR SELECT
  USING (user_id = auth.uid()::text);

-- Policy: Users can insert their own activity
CREATE POLICY "Users can insert own activity" ON user_activity
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- Grant access
GRANT ALL ON user_activity TO authenticated;
GRANT ALL ON user_activity TO service_role;
