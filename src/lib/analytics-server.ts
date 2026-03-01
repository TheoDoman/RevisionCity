/**
 * Server-Side Google Analytics 4 Event Tracking
 *
 * This module handles GA4 event tracking from server-side code (API routes, webhooks, etc.)
 * Uses the GA4 Measurement Protocol to send events directly to Google Analytics.
 *
 * Documentation: https://developers.google.com/analytics/devguides/collection/protocol/ga4
 */

/**
 * Send an event to GA4 using the Measurement Protocol
 * @param eventName - The name of the event
 * @param params - Event parameters
 * @param clientId - Optional client ID (user identifier)
 */
export async function trackServerEvent(
  eventName: string,
  params?: Record<string, any>,
  clientId?: string
) {
  // Only track if GA4 is configured
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!measurementId) {
    console.log('[GA4 Server] Measurement ID not configured, skipping event:', eventName);
    return;
  }

  // API secret is optional but recommended for server-side events
  if (!apiSecret) {
    console.log('[GA4 Server] API Secret not configured, skipping server event:', eventName);
    return;
  }

  try {
    // Generate a client ID if not provided (required by GA4)
    const gaClientId = clientId || `server-${Date.now()}-${Math.random()}`;

    // Construct the Measurement Protocol URL
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

    // Prepare the event payload
    const payload = {
      client_id: gaClientId,
      events: [
        {
          name: eventName,
          params: {
            ...params,
            engagement_time_msec: 100, // Required for events
          },
        },
      ],
    };

    // Send the event to GA4
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log('[GA4 Server] Event tracked successfully:', eventName, params);
    } else {
      const errorText = await response.text();
      console.error('[GA4 Server] Failed to track event:', response.status, errorText);
    }
  } catch (error) {
    console.error('[GA4 Server] Error tracking event:', error);
  }
}

/**
 * Track a server-side purchase event
 */
export async function trackServerPurchase(
  tier: string,
  interval: string,
  value: number,
  transactionId: string,
  userId?: string
) {
  await trackServerEvent(
    'purchase',
    {
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
    },
    userId
  );
}

/**
 * Track a server-side subscription event
 */
export async function trackServerSubscriptionEvent(
  eventName: 'subscription_created' | 'subscription_updated' | 'subscription_cancelled' | 'payment_succeeded' | 'payment_failed',
  tier: string,
  subscriptionId: string,
  userId?: string
) {
  await trackServerEvent(
    eventName,
    {
      tier,
      subscription_id: subscriptionId,
    },
    userId
  );
}

/**
 * Track a server-side test generation event
 */
export async function trackServerTestGeneration(
  subjectName: string,
  topicName: string,
  difficulty: number,
  questionCount: number,
  userId?: string
) {
  await trackServerEvent(
    'generate_test',
    {
      subject_name: subjectName,
      topic_name: topicName,
      difficulty,
      question_count: questionCount,
    },
    userId
  );
}
