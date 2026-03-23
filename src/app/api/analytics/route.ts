import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Simulate class-wide data deterministically based on topicId
function getClassData(topicId: string, yourScore: number) {
  // Seed a pseudo-random value based on topicId to keep it stable
  const seed = topicId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const classAverage = 55 + (seed % 20); // 55-75 range
  const percentile = Math.min(99, Math.max(1, Math.round((yourScore / classAverage) * 50)));
  return { classAverage, percentile };
}

function scoreToGrade(score: number): string {
  if (score >= 90) return '9';
  if (score >= 80) return '8';
  if (score >= 70) return '7';
  if (score >= 60) return '6';
  if (score >= 50) return '5';
  if (score >= 40) return '4';
  if (score >= 30) return '3';
  if (score >= 20) return '2';
  return '1';
}

function nextGradeTarget(grade: string): { grade: string; scoreNeeded: number } | null {
  const thresholds: Record<string, number> = {
    '1': 20, '2': 30, '3': 40, '4': 50, '5': 60, '6': 70, '7': 80, '8': 90, '9': 100,
  };
  const gradeNum = parseInt(grade);
  if (gradeNum >= 9) return null;
  const nextGrade = String(gradeNum + 1);
  return { grade: nextGrade, scoreNeeded: thresholds[nextGrade] };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const topicId = searchParams.get('topicId');
  const subjectId = searchParams.get('subjectId');
  // progressData is passed as JSON in a query param from the client
  const progressJson = searchParams.get('progress');

  if (!topicId) {
    return NextResponse.json({ error: 'topicId required' }, { status: 400 });
  }

  // Fetch subtopics for this topic to get their names
  const { data: subtopics } = await supabase
    .from('subtopics')
    .select('id, name, order_index')
    .eq('topic_id', topicId)
    .order('order_index');

  const subtopicList = subtopics || [];

  // Parse client-side progress data
  const progress: Record<string, {
    notes_read?: boolean;
    flashcards_reviewed?: number;
    quiz_best_score?: number;
    practice_questions_completed?: number;
    recall_prompts_completed?: number;
  }> = progressJson ? JSON.parse(progressJson) : {};

  // Equal-weight score across all 5 content types
  function computeScore(p: typeof progress[string]): number {
    if (!p) return 0;
    return Math.round((
      (p.notes_read ? 100 : 0) +
      ((p.flashcards_reviewed ?? 0) > 0 ? 100 : 0) +
      (p.quiz_best_score ?? 0) +
      ((p.practice_questions_completed ?? 0) > 0 ? 100 : 0) +
      ((p.recall_prompts_completed ?? 0) > 0 ? 100 : 0)
    ) / 5);
  }

  function hasActivity(p: typeof progress[string]): boolean {
    if (!p) return false;
    return !!(p.notes_read || (p.flashcards_reviewed ?? 0) > 0 || (p.quiz_best_score ?? 0) > 0 ||
              (p.practice_questions_completed ?? 0) > 0 || (p.recall_prompts_completed ?? 0) > 0);
  }

  // Build topic breakdown from progress
  const topicBreakdown = subtopicList.map((s) => {
    const p = progress[s.id];
    const avg = computeScore(p);
    const active = hasActivity(p);
    return {
      subtopicId: s.id,
      topic: s.name,
      avg,
      attempts: active ? 1 : 0,
      trend: avg > 70 ? 'up' : avg > 40 ? 'stable' : 'down',
    };
  });

  // Overall score (average of attempted subtopics)
  const attempted = topicBreakdown.filter((t) => t.attempts > 0);
  const overallScore =
    attempted.length > 0
      ? Math.round(attempted.reduce((sum, t) => sum + t.avg, 0) / attempted.length)
      : 0;

  // Weak areas: subtopics with score < 60, sorted by most improvement needed
  const weakAreas = topicBreakdown
    .filter((t) => t.avg > 0 && t.avg < 60)
    .sort((a, b) => a.avg - b.avg)
    .map((t) => t.topic);

  // Grade predictor
  const currentGrade = scoreToGrade(overallScore);
  const nextTarget = nextGradeTarget(currentGrade);
  const improvingCount = topicBreakdown.filter((t) => t.trend === 'up').length;
  const decliningCount = topicBreakdown.filter((t) => t.trend === 'down').length;
  const isImproving = improvingCount >= decliningCount;

  let projectedGrade = currentGrade;
  let hoursNeeded = 0;
  if (nextTarget && overallScore > 0) {
    const scoreGap = nextTarget.scoreNeeded - overallScore;
    hoursNeeded = Math.max(1, Math.round(scoreGap * 0.8));
    // If improving, project one grade up
    projectedGrade = isImproving && scoreGap <= 15 ? nextTarget.grade : currentGrade;
  }

  // Derive streaks from total activity across all content types
  const totalFlashcardsReviewed = Object.values(progress).reduce(
    (sum, p) => sum + (p.flashcards_reviewed ?? 0),
    0
  );
  const activeSubtopics = Object.values(progress).filter(hasActivity).length;
  const currentStreak = Math.min(30, activeSubtopics);
  const longestStreak = Math.max(currentStreak, Math.floor(activeSubtopics * 1.5));
  const quizzesToday = Object.values(progress).filter((p) => (p.quiz_best_score ?? 0) > 0).length;

  // Class comparison
  const { classAverage, percentile } = getClassData(topicId, overallScore);

  // Generate 7-day trend data (simulate based on current score)
  const today = new Date();
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    const dayLabel = date.toLocaleDateString('en-GB', { weekday: 'short' });
    // Simulate gradual improvement leading to current score
    const factor = (i + 1) / 7;
    const dayScore = overallScore > 0 ? Math.round(overallScore * (0.6 + factor * 0.4)) : 0;
    return { day: dayLabel, score: dayScore };
  });

  const response = {
    overallScore,
    topicBreakdown,
    gradePredictor: {
      currentGrade,
      projectedGrade,
      hoursNeeded,
      weakAreas,
      momentum: isImproving ? 'improving' : 'declining',
    },
    streaks: {
      currentStreak,
      longestStreak,
      quizzesToday,
    },
    compareToClass: {
      yourScore: overallScore,
      classAverage,
      percentile,
    },
    trendData,
    subtopicCount: subtopicList.length,
    attemptedCount: attempted.length,
  };

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
