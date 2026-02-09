import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UserProgress {
  subjectsStarted: number;
  topicsCompleted: number;
  quizAverage: string;
  studyStreak: number;
}

export interface RecentActivity {
  subject: string;
  topic: string;
  type: string;
  score: string;
  time: string;
  timestamp: Date;
}

/**
 * Get user's progress statistics
 */
export async function getUserProgress(userId: string): Promise<UserProgress> {
  try {
    // Get user activity from database
    const { data: activities } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!activities || activities.length === 0) {
      return {
        subjectsStarted: 0,
        topicsCompleted: 0,
        quizAverage: '0%',
        studyStreak: 0,
      };
    }

    // Calculate subjects started (unique subjects viewed)
    const uniqueSubjects = new Set(activities.map(a => a.subject_id).filter(Boolean));
    const subjectsStarted = uniqueSubjects.size;

    // Calculate topics completed (topics with activity)
    const uniqueTopics = new Set(activities.map(a => a.topic_id).filter(Boolean));
    const topicsCompleted = uniqueTopics.size;

    // Calculate quiz average from quiz activities
    const quizActivities = activities.filter(a => a.activity_type === 'quiz' && a.score !== null);
    let quizAverage = '0%';
    if (quizActivities.length > 0) {
      const avgScore = quizActivities.reduce((sum, a) => sum + (a.score || 0), 0) / quizActivities.length;
      quizAverage = `${Math.round(avgScore)}%`;
    }

    // Calculate study streak (consecutive days with activity)
    const studyStreak = calculateStudyStreak(activities.map(a => new Date(a.created_at)));

    return {
      subjectsStarted,
      topicsCompleted,
      quizAverage,
      studyStreak,
    };
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return {
      subjectsStarted: 0,
      topicsCompleted: 0,
      quizAverage: '0%',
      studyStreak: 0,
    };
  }
}

/**
 * Get user's recent activity
 */
export async function getRecentActivity(userId: string, limit: number = 5): Promise<RecentActivity[]> {
  try {
    const { data: activities } = await supabase
      .from('user_activity')
      .select(`
        *,
        subjects!inner(name),
        topics!inner(name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!activities || activities.length === 0) {
      return [];
    }

    return activities.map(activity => ({
      subject: activity.subjects.name,
      topic: activity.topics.name,
      type: formatActivityType(activity.activity_type),
      score: formatScore(activity.activity_type, activity.score),
      time: formatTimeAgo(new Date(activity.created_at)),
      timestamp: new Date(activity.created_at),
    }));
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

/**
 * Log user activity
 */
export async function logUserActivity(
  userId: string,
  activityType: 'quiz' | 'flashcard' | 'note' | 'practice' | 'recall' | 'test',
  subjectId?: string,
  topicId?: string,
  subtopicId?: string,
  score?: number
) {
  try {
    await supabase.from('user_activity').insert({
      user_id: userId,
      activity_type: activityType,
      subject_id: subjectId,
      topic_id: topicId,
      subtopic_id: subtopicId,
      score: score,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging user activity:', error);
  }
}

/**
 * Calculate consecutive study streak in days
 */
function calculateStudyStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  // Sort dates descending
  const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime());

  // Get unique days (ignore time)
  const uniqueDays = Array.from(
    new Set(sortedDates.map(d => d.toISOString().split('T')[0]))
  ).map(d => new Date(d));

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < uniqueDays.length; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    checkDate.setHours(0, 0, 0, 0);

    const activityDate = new Date(uniqueDays[i]);
    activityDate.setHours(0, 0, 0, 0);

    if (activityDate.getTime() === checkDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Format activity type for display
 */
function formatActivityType(type: string): string {
  const types: Record<string, string> = {
    quiz: 'Quiz',
    flashcard: 'Flashcards',
    note: 'Notes',
    practice: 'Practice',
    recall: 'Recall',
    test: 'AI Test',
  };
  return types[type] || type;
}

/**
 * Format score for display
 */
function formatScore(type: string, score: number | null): string {
  if (score === null) {
    return type === 'note' ? 'Viewed' : 'Completed';
  }
  return `${Math.round(score)}%`;
}

/**
 * Format time ago
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }
}
