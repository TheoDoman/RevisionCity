import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Brain, Target, Zap, TrendingUp, Clock } from 'lucide-react'
import { getUserProgress, getRecentActivity } from '@/lib/user-progress'

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Fetch real user progress
  const progress = await getUserProgress(user.id)
  const recentActivity = await getRecentActivity(user.id, 5)

  const stats = [
    {
      name: 'Subjects Started',
      value: progress.subjectsStarted.toString(),
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      name: 'Topics Completed',
      value: progress.topicsCompleted.toString(),
      icon: Target,
      color: 'from-green-500 to-emerald-600'
    },
    {
      name: 'Quiz Average',
      value: progress.quizAverage,
      icon: Brain,
      color: 'from-purple-500 to-violet-600'
    },
    {
      name: 'Study Streak',
      value: progress.studyStreak > 0 ? `${progress.studyStreak} days` : '0 days',
      icon: Zap,
      color: 'from-orange-500 to-red-600'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-display text-3xl font-bold text-brand-950 mb-2">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-brand-600">
            {progress.subjectsStarted > 0
              ? "Keep up the great work! Here's your progress overview."
              : "Start studying to see your progress here!"
            }
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.name}
              className="bg-white rounded-2xl border-2 border-brand-100 p-6 hover:shadow-lg transition-all animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                  <stat.icon className="h-6 w-6 text-brand-600" />
                </div>
                {parseInt(stat.value) > 0 && <TrendingUp className="h-5 w-5 text-success-500" />}
              </div>
              <p className="text-sm text-brand-500 mb-1">{stat.name}</p>
              <p className="font-display text-3xl font-bold text-brand-950">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
              <h2 className="font-display text-xl font-bold text-brand-950 mb-6">
                Recent Activity
              </h2>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-brand-200 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-brand-600" />
                        </div>
                        <div>
                          <p className="font-medium text-brand-900">{activity.subject}</p>
                          <p className="text-sm text-brand-600">{activity.topic} • {activity.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-brand-900">{activity.score}</p>
                        <p className="text-sm text-brand-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-brand-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-brand-300" />
                  <p className="mb-2">No activity yet!</p>
                  <p className="text-sm">Start studying to see your progress here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-2xl border-2 border-brand-100 p-6">
              <h2 className="font-display text-xl font-bold text-brand-950 mb-6">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href="/subjects"
                  className="block w-full p-4 bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5" />
                    <span className="font-medium">Browse Subjects</span>
                  </div>
                </Link>
                <Link
                  href="/ai-generator"
                  className="block w-full p-4 bg-gradient-to-br from-accent-500 to-accent-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5" />
                    <span className="font-medium">AI Test Generator</span>
                  </div>
                </Link>
                <Link
                  href="/pricing"
                  className="block w-full p-4 border-2 border-brand-200 text-brand-900 rounded-xl hover:border-brand-300 hover:bg-brand-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5" />
                    <span className="font-medium">Upgrade Plan</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Study Tips */}
            <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200 p-6">
              <h3 className="font-display text-lg font-bold text-purple-900 mb-3">
                💡 Study Tip
              </h3>
              <p className="text-sm text-purple-700">
                {progress.studyStreak > 0
                  ? `Great job! You're on a ${progress.studyStreak}-day streak. Keep it up!`
                  : "Consistency is key! Try to study a little bit every day to build a strong foundation."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
