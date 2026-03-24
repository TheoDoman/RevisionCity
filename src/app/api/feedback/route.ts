import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { rateLimit, getIP, tooManyRequests } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limiting: 5 req/min per IP (auth-adjacent route — calls email service)
  const ip = getIP(request)
  const { allowed, retryAfter } = rateLimit(`auth:${ip}`, 5)
  if (!allowed) return tooManyRequests(retryAfter)

  try {
    const { feedbackType, rating, message, email, subject } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get user info if signed in
    const user = await currentUser()
    const userEmail = email || user?.emailAddresses?.[0]?.emailAddress || 'Anonymous'
    const userName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : 'Anonymous'

    // Send email via mailto (using a simple fetch to an email service)
    // For now we send to support email via a simple POST
    const emailBody = `
New Feedback Submission - Revision City

Type: ${feedbackType}
Rating: ${rating ? `${rating}/5` : 'Not provided'}
${subject ? `Subject/Topic: ${subject}` : ''}

From: ${userName} (${userEmail})
User ID: ${user?.id ?? 'Not signed in'}

Message:
${message}

---
Sent from revisioncity.net/feedback
    `.trim()

    // Use Resend, SendGrid, or any email provider you have.
    // For now, log it and store it (you can hook up an email service later).
    console.log('📬 New Feedback Received:')
    console.log(emailBody)

    // If you have a RESEND_API_KEY or SENDGRID_API_KEY set, use it here.
    // Otherwise feedback is logged on the server.
    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Revision City Feedback <feedback@revisioncity.net>',
          to: ['support@revisioncity.net'],
          reply_to: userEmail !== 'Anonymous' ? userEmail : undefined,
          subject: `[${feedbackType.toUpperCase()}] New Feedback${rating ? ` - ${rating}/5 stars` : ''}`,
          text: emailBody,
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}
