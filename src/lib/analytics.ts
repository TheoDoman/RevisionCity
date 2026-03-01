/**
 * Google Analytics 4 Event Tracking Utilities
 *
 * This module provides type-safe event tracking for GA4.
 * Usage: Import and call these functions to track user events throughout the app.
 */

// Extend the Window interface to include gtag
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

/**
 * Check if GA4 is loaded and available
 */
export const isGALoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

/**
 * Track a custom event in GA4
 * @param eventName - The name of the event
 * @param params - Additional parameters for the event
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (!isGALoaded()) {
    console.warn('GA4 not loaded. Event not tracked:', eventName);
    return;
  }

  try {
    window.gtag!('event', eventName, params);
    console.log('GA4 Event tracked:', eventName, params);
  } catch (error) {
    console.error('Error tracking GA4 event:', error);
  }
};

/**
 * Track a page view (automatic with Next.js App Router, but can be called manually if needed)
 * @param url - The page URL
 * @param title - The page title
 */
export const trackPageView = (url: string, title?: string) => {
  if (!isGALoaded()) {
    return;
  }

  try {
    window.gtag!('event', 'page_view', {
      page_path: url,
      page_title: title || document.title,
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// ============================================================================
// USER AUTHENTICATION EVENTS
// ============================================================================

/**
 * Track user sign up
 * @param method - The authentication method used (e.g., 'email', 'google', 'github')
 */
export const trackSignUp = (method: string = 'email') => {
  trackEvent('sign_up', {
    method,
  });
};

/**
 * Track user login
 * @param method - The authentication method used
 */
export const trackLogin = (method: string = 'email') => {
  trackEvent('login', {
    method,
  });
};

// ============================================================================
// SUBSCRIPTION EVENTS
// ============================================================================

/**
 * Track when a user views the pricing page
 */
export const trackViewPricing = () => {
  trackEvent('view_pricing');
};

/**
 * Track when a user initiates checkout
 * @param tier - The subscription tier ('free', 'pro', 'premium')
 * @param interval - The billing interval ('monthly', 'yearly')
 * @param value - The price value
 */
export const trackBeginCheckout = (
  tier: string,
  interval: 'monthly' | 'yearly',
  value: number
) => {
  trackEvent('begin_checkout', {
    currency: 'EUR',
    value,
    items: [
      {
        item_id: `${tier}_${interval}`,
        item_name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
        item_category: 'subscription',
        price: value,
        quantity: 1,
      },
    ],
    tier,
    interval,
  });
};

/**
 * Track successful subscription purchase
 * @param tier - The subscription tier
 * @param interval - The billing interval
 * @param value - The transaction value
 * @param transactionId - The Stripe transaction/subscription ID
 */
export const trackPurchase = (
  tier: string,
  interval: 'monthly' | 'yearly',
  value: number,
  transactionId: string
) => {
  trackEvent('purchase', {
    currency: 'EUR',
    value,
    transaction_id: transactionId,
    items: [
      {
        item_id: `${tier}_${interval}`,
        item_name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
        item_category: 'subscription',
        price: value,
        quantity: 1,
      },
    ],
    tier,
    interval,
  });
};

/**
 * Track subscription cancellation
 * @param tier - The subscription tier that was cancelled
 * @param subscriptionId - The Stripe subscription ID
 */
export const trackCancelSubscription = (tier: string, subscriptionId: string) => {
  trackEvent('cancel_subscription', {
    tier,
    subscription_id: subscriptionId,
  });
};

/**
 * Track subscription renewal
 * @param tier - The subscription tier
 * @param subscriptionId - The Stripe subscription ID
 */
export const trackSubscriptionRenewal = (tier: string, subscriptionId: string) => {
  trackEvent('subscription_renewal', {
    tier,
    subscription_id: subscriptionId,
  });
};

// ============================================================================
// CONTENT INTERACTION EVENTS
// ============================================================================

/**
 * Track when a user views a subject page
 * @param subjectName - The name of the subject
 * @param subjectSlug - The subject URL slug
 */
export const trackViewSubject = (subjectName: string, subjectSlug: string) => {
  trackEvent('view_subject', {
    subject_name: subjectName,
    subject_slug: subjectSlug,
  });
};

/**
 * Track when a user views a topic page
 * @param topicName - The name of the topic
 * @param subjectName - The parent subject
 */
export const trackViewTopic = (topicName: string, subjectName: string) => {
  trackEvent('view_topic', {
    topic_name: topicName,
    subject_name: subjectName,
  });
};

/**
 * Track when a user views a subtopic/note
 * @param subtopicName - The name of the subtopic
 * @param topicName - The parent topic
 * @param subjectName - The parent subject
 */
export const trackViewNote = (
  subtopicName: string,
  topicName: string,
  subjectName: string
) => {
  trackEvent('view_note', {
    subtopic_name: subtopicName,
    topic_name: topicName,
    subject_name: subjectName,
  });
};

/**
 * Track when a user attempts to unlock paid content
 * @param contentType - The type of content ('note', 'quiz', 'flashcard', 'mindmap', 'summary')
 * @param requiredTier - The subscription tier required
 */
export const trackContentUnlockAttempt = (
  contentType: string,
  requiredTier: string
) => {
  trackEvent('content_unlock_attempt', {
    content_type: contentType,
    required_tier: requiredTier,
  });
};

/**
 * Track when a user successfully unlocks paid content
 * @param contentType - The type of content unlocked
 * @param userTier - The user's subscription tier
 */
export const trackContentUnlocked = (contentType: string, userTier: string) => {
  trackEvent('content_unlocked', {
    content_type: contentType,
    user_tier: userTier,
  });
};

// ============================================================================
// TEST GENERATION EVENTS
// ============================================================================

/**
 * Track when a user generates a test
 * @param subjectName - The subject of the test
 * @param topicName - The topic of the test
 * @param difficulty - The difficulty level (1-10)
 * @param questionCount - Number of questions generated
 */
export const trackGenerateTest = (
  subjectName: string,
  topicName: string,
  difficulty: number,
  questionCount: number
) => {
  trackEvent('generate_test', {
    subject_name: subjectName,
    topic_name: topicName,
    difficulty,
    question_count: questionCount,
  });
};

/**
 * Track when a user completes a test
 * @param testId - The test identifier
 * @param score - The score achieved (0-100)
 * @param totalQuestions - Total number of questions
 */
export const trackCompleteTest = (
  testId: string,
  score: number,
  totalQuestions: number
) => {
  trackEvent('complete_test', {
    test_id: testId,
    score,
    total_questions: totalQuestions,
  });
};

// ============================================================================
// QUIZ & FLASHCARD EVENTS
// ============================================================================

/**
 * Track when a user starts a quiz
 * @param topicName - The topic of the quiz
 * @param questionCount - Number of questions in the quiz
 */
export const trackStartQuiz = (topicName: string, questionCount: number) => {
  trackEvent('start_quiz', {
    topic_name: topicName,
    question_count: questionCount,
  });
};

/**
 * Track when a user completes a quiz
 * @param topicName - The topic of the quiz
 * @param score - The score achieved
 * @param totalQuestions - Total number of questions
 */
export const trackCompleteQuiz = (
  topicName: string,
  score: number,
  totalQuestions: number
) => {
  trackEvent('complete_quiz', {
    topic_name: topicName,
    score,
    total_questions: totalQuestions,
    percentage: Math.round((score / totalQuestions) * 100),
  });
};

/**
 * Track when a user views flashcards
 * @param topicName - The topic of the flashcards
 * @param cardCount - Number of flashcards viewed
 */
export const trackViewFlashcards = (topicName: string, cardCount: number) => {
  trackEvent('view_flashcards', {
    topic_name: topicName,
    card_count: cardCount,
  });
};

// ============================================================================
// ENGAGEMENT EVENTS
// ============================================================================

/**
 * Track when a user searches
 * @param searchTerm - The search query
 * @param resultsCount - Number of results returned
 */
export const trackSearch = (searchTerm: string, resultsCount?: number) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
};

/**
 * Track when a user clicks on a call-to-action
 * @param ctaName - The name/location of the CTA
 * @param destination - Where the CTA leads
 */
export const trackCTAClick = (ctaName: string, destination: string) => {
  trackEvent('cta_click', {
    cta_name: ctaName,
    destination,
  });
};

/**
 * Track when a user shares content
 * @param contentType - The type of content shared
 * @param method - The sharing method (e.g., 'twitter', 'facebook', 'link')
 */
export const trackShare = (contentType: string, method: string) => {
  trackEvent('share', {
    content_type: contentType,
    method,
  });
};

// ============================================================================
// ERROR TRACKING
// ============================================================================

/**
 * Track errors for debugging and monitoring
 * @param errorMessage - The error message
 * @param errorLocation - Where the error occurred
 * @param fatal - Whether the error is fatal
 */
export const trackError = (
  errorMessage: string,
  errorLocation: string,
  fatal: boolean = false
) => {
  trackEvent('exception', {
    description: errorMessage,
    location: errorLocation,
    fatal,
  });
};
