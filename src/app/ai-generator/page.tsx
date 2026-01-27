'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Print styles
const printStyles = `
  @media print {
    body * { visibility: hidden; }
    .print-test, .print-test * { visibility: visible; }
    .print-test {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .no-print { display: none !important; }
    .print-test .answer-section {
      border: 2px solid #22c55e;
      page-break-inside: avoid;
    }
  }

  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`

interface Subject {
  id: string
  name: string
  slug: string
}

interface Topic {
  id: string
  name: string
  slug: string
}

export default function AIGeneratorPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [difficulty, setDifficulty] = useState<number>(5)
  const [questionCount, setQuestionCount] = useState<number>(10)
  const [loading, setLoading] = useState(false)
  const [generatedTest, setGeneratedTest] = useState<any>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState<number>(0)

  // Load subjects
  useEffect(() => {
    async function loadSubjects() {
      const { data } = await supabase
        .from('subjects')
        .select('id, name, slug')
        .order('name')

      if (data) setSubjects(data)
    }
    loadSubjects()
  }, [])

  // Load topics when subject changes
  useEffect(() => {
    if (!selectedSubject) return

    async function loadTopics() {
      const { data } = await supabase
        .from('topics')
        .select('id, name, slug')
        .eq('subject_id', selectedSubject)
        .order('order_index')

      if (data) setTopics(data)
    }
    loadTopics()
  }, [selectedSubject])

  const generateTest = async () => {
    if (!selectedSubject || !selectedTopic) return

    setLoading(true)
    setError(null)
    setGeneratedTest(null)
    setUserAnswers({})
    setIsSubmitted(false)
    setScore(0)

    try {
      const response = await fetch('/api/ai/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubject,
          topicId: selectedTopic,
          difficulty,
          questionCount
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate test')
      }

      setGeneratedTest(data.test)

      // Show confetti animation
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)

      // Scroll to test
      setTimeout(() => {
        document.getElementById('generated-test')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 100)
    } catch (error) {
      console.error('Generation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate test. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  const submitTest = () => {
    if (!generatedTest) return

    let totalScore = 0
    let earnedScore = 0

    generatedTest.questions.forEach((q: any, i: number) => {
      totalScore += q.marks
      const userAnswer = userAnswers[i]?.trim().toLowerCase()
      const correctAnswer = q.answer?.trim().toLowerCase()

      if (userAnswer && correctAnswer) {
        // For multiple choice, check exact match
        if (q.type === 'multiple_choice') {
          if (userAnswer === correctAnswer) {
            earnedScore += q.marks
          }
        } else {
          // For short answer, check if answer contains key terms
          if (userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer)) {
            earnedScore += q.marks
          }
        }
      }
    })

    setScore(earnedScore)
    setIsSubmitted(true)

    // Scroll to results
    setTimeout(() => {
      document.getElementById('test-results')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 100)
  }

  const resetTest = () => {
    setUserAnswers({})
    setIsSubmitted(false)
    setScore(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      <style>{printStyles}</style>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 py-8 md:py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl mb-4 transform hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            AI Test Generator
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Generate unlimited unique practice tests powered by AI. Complete tests interactively and get instant feedback.
          </p>
        </div>

        {/* Generator Form */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Subject Select */}
            <div className="transform hover:scale-[1.02] transition-transform duration-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value)
                  setSelectedTopic('')
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300 bg-white"
              >
                <option value="">Select a subject...</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Select */}
            <div className="transform hover:scale-[1.02] transition-transform duration-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Topic
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={!selectedSubject}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 hover:border-gray-300 bg-white"
              >
                <option value="">Select a topic...</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Difficulty Slider */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Difficulty Level: <span className="text-indigo-600">{difficulty}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={difficulty}
              onChange={(e) => setDifficulty(parseInt(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #86efac 0%, #fde047 50%, #fca5a5 100%)`
              }}
            />
            <div className="flex justify-between text-xs font-medium text-gray-500 mt-2">
              <span>Easy</span>
              <span>Medium</span>
              <span>Hard</span>
            </div>
          </div>

          {/* Question Count Slider */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Number of Questions: <span className="text-indigo-600">{questionCount}</span>
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full h-3 bg-indigo-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs font-medium text-gray-500 mt-2">
              <span>5</span>
              <span>15</span>
              <span>30</span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateTest}
            disabled={!selectedSubject || !selectedTopic || loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating Your Test...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Test
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8 animate-[slideInUp_0.3s_ease-out]">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-1">Oops! Something went wrong</h3>
                <p className="text-red-700 text-sm mb-4">{error}</p>
                <button
                  onClick={generateTest}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 animate-[fadeIn_0.3s_ease-out]">
            <div className="space-y-6">
              {/* Header Skeleton */}
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 animate-[shimmer_2s_infinite]" style={{
                    backgroundImage: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
                    backgroundSize: '1000px 100%'
                  }}></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2 animate-[shimmer_2s_infinite]" style={{
                    backgroundImage: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
                    backgroundSize: '1000px 100%'
                  }}></div>
                </div>
              </div>

              {/* Question Skeletons */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-6 space-y-4">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/4 animate-[shimmer_2s_infinite]" style={{
                    backgroundImage: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
                    backgroundSize: '1000px 100%',
                    animationDelay: `${i * 0.1}s`
                  }}></div>
                  <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full animate-[shimmer_2s_infinite]" style={{
                    backgroundImage: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
                    backgroundSize: '1000px 100%',
                    animationDelay: `${i * 0.1}s`
                  }}></div>
                  <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-5/6 animate-[shimmer_2s_infinite]" style={{
                    backgroundImage: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)',
                    backgroundSize: '1000px 100%',
                    animationDelay: `${i * 0.1}s`
                  }}></div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-indigo-600 font-semibold text-lg mb-2">Crafting your perfect test...</p>
              <p className="text-gray-500 text-sm">This usually takes 10-15 seconds</p>
            </div>
          </div>
        )}

        {/* Generated Test Display */}
        {generatedTest && (
          <div id="generated-test" className="bg-white rounded-3xl shadow-xl p-8 print-test">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{generatedTest.metadata?.subject} - {generatedTest.metadata?.topic}</h2>
                <p className="text-gray-600 mt-1">
                  {generatedTest.metadata?.questionCount} questions • {generatedTest.metadata?.totalMarks} marks • Difficulty: {generatedTest.metadata?.difficulty}/10
                </p>
              </div>
              {!isSubmitted && (
                <button
                  onClick={() => window.print()}
                  className="no-print flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Test
                </button>
              )}
            </div>

            <div className="space-y-6">
              {generatedTest.questions?.map((q: any, i: number) => (
                <div key={i} className={`border rounded-lg p-6 ${
                  isSubmitted
                    ? userAnswers[i]?.trim().toLowerCase() === q.answer?.trim().toLowerCase()
                      ? 'border-green-300 bg-green-50'
                      : 'border-red-300 bg-red-50'
                    : 'border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">Question {i + 1}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        q.type === 'multiple_choice'
                          ? 'bg-blue-100 text-blue-700'
                          : q.type === 'short_answer'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {q.type.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">[{q.marks} mark{q.marks > 1 ? 's' : ''}]</span>
                  </div>

                  <p className="text-gray-900 mb-4 leading-relaxed">{q.question}</p>

                  {/* Multiple Choice Options */}
                  {q.type === 'multiple_choice' && q.options && !isSubmitted && (
                    <div className="space-y-2">
                      {q.options.map((opt: string, j: number) => (
                        <label key={j} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name={`question-${i}`}
                            value={opt}
                            checked={userAnswers[i] === opt}
                            onChange={(e) => handleAnswerChange(i, e.target.value)}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Short Answer / Long Response Input */}
                  {q.type !== 'multiple_choice' && !isSubmitted && (
                    <textarea
                      value={userAnswers[i] || ''}
                      onChange={(e) => handleAnswerChange(i, e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                      rows={q.type === 'long_response' ? 6 : 3}
                    />
                  )}

                  {/* Show user's answer and correct answer after submission */}
                  {isSubmitted && (
                    <>
                      <div className="mt-4 space-y-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm font-semibold text-blue-900 mb-1">Your Answer:</p>
                          <p className="text-sm text-blue-800">{userAnswers[i] || '(No answer provided)'}</p>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm font-semibold text-green-900 mb-1">✓ Correct Answer:</p>
                          <p className="text-sm text-green-800">{q.answer}</p>
                        </div>

                        {q.explanation && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <p className="text-sm font-semibold text-purple-900 mb-1">💡 Explanation:</p>
                            <p className="text-sm text-purple-800">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Submit / Results Section */}
            {!isSubmitted ? (
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
                <p className="text-gray-600 font-medium">
                  Total: {generatedTest.metadata?.totalMarks} marks
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setGeneratedTest(null)}
                    className="no-print px-6 py-3 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Generate New Test
                  </button>
                  <button
                    onClick={submitTest}
                    className="no-print px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-lg"
                  >
                    Submit Test
                  </button>
                </div>
              </div>
            ) : (
              <div id="test-results" className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Test Results</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-5xl font-bold text-indigo-600">{score}</span>
                    <span className="text-3xl text-gray-600">/ {generatedTest.metadata?.totalMarks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-4 rounded-full transition-all duration-1000"
                      style={{ width: `${(score / generatedTest.metadata?.totalMarks) * 100}%` }}
                    />
                  </div>
                  <p className="text-gray-700 font-medium">
                    {score / generatedTest.metadata?.totalMarks >= 0.8 ? '🎉 Excellent work!' :
                     score / generatedTest.metadata?.totalMarks >= 0.6 ? '👍 Good effort!' :
                     score / generatedTest.metadata?.totalMarks >= 0.4 ? '💪 Keep practicing!' :
                     '📚 Review the material and try again!'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={resetTest}
                    className="flex-1 px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
                  >
                    Retry Test
                  </button>
                  <button
                    onClick={() => setGeneratedTest(null)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg"
                  >
                    Generate New Test
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Premium Upsell */}
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Unlock Unlimited Tests</h3>
              <p className="text-gray-600 text-sm">
                Upgrade to Premium for unlimited AI-generated tests, detailed explanations, and progress tracking!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
