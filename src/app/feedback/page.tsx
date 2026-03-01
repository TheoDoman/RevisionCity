'use client'

import { useState } from 'react'
import { MessageSquarePlus, Star, Bug, Lightbulb, ThumbsUp, Send, CheckCircle } from 'lucide-react'

type FeedbackType = 'general' | 'bug' | 'feature' | 'content'
type Rating = 1 | 2 | 3 | 4 | 5

const feedbackTypes = [
  { id: 'general' as FeedbackType, label: 'General Feedback', icon: ThumbsUp, color: 'brand' },
  { id: 'bug' as FeedbackType, label: 'Report a Bug', icon: Bug, color: 'red' },
  { id: 'feature' as FeedbackType, label: 'Feature Request', icon: Lightbulb, color: 'amber' },
  { id: 'content' as FeedbackType, label: 'Content Issue', icon: MessageSquarePlus, color: 'purple' },
]

const colorMap: Record<string, { bg: string; border: string; text: string; selected: string }> = {
  brand: {
    bg: 'bg-brand-50',
    border: 'border-brand-200',
    text: 'text-brand-600',
    selected: 'bg-brand-600 border-brand-600 text-white',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-600',
    selected: 'bg-red-600 border-red-600 text-white',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    selected: 'bg-amber-500 border-amber-500 text-white',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    selected: 'bg-purple-600 border-purple-600 text-white',
  },
}

export default function FeedbackPage() {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general')
  const [rating, setRating] = useState<Rating | null>(null)
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackType, rating, message, email, subject }),
      })

      if (!res.ok) throw new Error('Failed to submit')

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again or email us directly at support@revisioncity.net')
    } finally {
      setSubmitting(false)
    }
  }

  const ratingLabels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Great',
    5: 'Excellent',
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-display text-3xl font-bold text-brand-950 mb-3">Thank you!</h2>
          <p className="text-brand-600 text-lg mb-8">
            Your feedback means a lot to us. We read every submission and use it to make Revision City better for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setSubmitted(false)
                setMessage('')
                setEmail('')
                setSubject('')
                setRating(null)
                setFeedbackType('general')
              }}
              className="px-6 py-3 border-2 border-brand-600 text-brand-600 rounded-xl hover:bg-brand-50 transition-colors font-medium"
            >
              Send More Feedback
            </button>
            <a
              href="/subjects"
              className="px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors font-medium"
            >
              Back to Studying
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white py-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquarePlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-brand-950 mb-3">Share Your Feedback</h1>
          <p className="text-brand-600 text-lg">
            Help us improve Revision City. Every piece of feedback is read by our team.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Feedback Type */}
          <div className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm">
            <label className="block font-semibold text-brand-900 mb-4">What type of feedback is this?</label>
            <div className="grid grid-cols-2 gap-3">
              {feedbackTypes.map(({ id, label, icon: Icon, color }) => {
                const colors = colorMap[color]
                const isSelected = feedbackType === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFeedbackType(id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all font-medium text-sm text-left ${
                      isSelected
                        ? colors.selected
                        : `${colors.bg} ${colors.border} ${colors.text} hover:opacity-80`
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Star Rating */}
          <div className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm">
            <label className="block font-semibold text-brand-900 mb-4">
              How would you rate Revision City overall?
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star as Rating)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      star <= (hoveredStar ?? rating ?? 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {(hoveredStar || rating) && (
                <span className="ml-2 text-brand-600 font-medium">
                  {ratingLabels[hoveredStar ?? rating ?? 0]}
                </span>
              )}
            </div>
          </div>

          {/* Subject (conditional for content issues) */}
          {feedbackType === 'content' && (
            <div className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm">
              <label className="block font-semibold text-brand-900 mb-2">
                Which subject/topic does this relate to?
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Chemistry - Organic Chemistry - Polymers"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none text-brand-900 placeholder-gray-400"
              />
            </div>
          )}

          {/* Message */}
          <div className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm">
            <label className="block font-semibold text-brand-900 mb-2">
              Your feedback <span className="text-red-500">*</span>
            </label>
            <p className="text-brand-500 text-sm mb-3">
              {feedbackType === 'bug' && 'Describe what happened and how to reproduce it.'}
              {feedbackType === 'feature' && 'Describe the feature you\'d like to see and why it would help.'}
              {feedbackType === 'content' && 'Tell us what\'s incorrect or missing in the content.'}
              {feedbackType === 'general' && 'Share anything on your mind - what\'s working, what isn\'t, or ideas you have.'}
            </p>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your feedback here..."
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none text-brand-900 placeholder-gray-400 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{message.length} characters</p>
          </div>

          {/* Email (optional) */}
          <div className="bg-white rounded-2xl p-6 border border-brand-100 shadow-sm">
            <label className="block font-semibold text-brand-900 mb-1">
              Email address <span className="text-brand-400 font-normal">(optional)</span>
            </label>
            <p className="text-brand-500 text-sm mb-3">
              Leave your email if you'd like us to follow up with you.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all outline-none text-brand-900 placeholder-gray-400"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!message.trim() || submitting}
            className="w-full py-4 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Feedback
              </>
            )}
          </button>

          <p className="text-center text-brand-400 text-sm">
            You can also reach us directly at{' '}
            <a href="mailto:support@revisioncity.net" className="text-brand-600 hover:underline">
              support@revisioncity.net
            </a>
          </p>

        </form>
      </div>
    </div>
  )
}
