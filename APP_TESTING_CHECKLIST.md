# Revision City - Complete Testing Checklist

## 1. Homepage (/) ✓
- [ ] Hero section displays correctly
- [ ] All 9 subjects show with correct icons
- [ ] Features section loads properly
- [ ] CTA buttons work (Get Started, View Subjects)
- [ ] Navigation menu works
- [ ] Responsive on mobile

## 2. Authentication
- [ ] Sign up works (test with new email)
- [ ] Sign in works (existing account)
- [ ] Sign out works
- [ ] Clerk authentication redirects properly

## 3. Subjects Page (/subjects)
- [ ] All 9 subjects display
- [ ] Subject cards clickable
- [ ] Links go to correct subject pages
- [ ] Search/filter works (if applicable)

## 4. Subject Pages (/subject/[slug])
Test each subject:
- [ ] Physics
- [ ] Chemistry
- [ ] Biology
- [ ] Mathematics
- [ ] Computer Science
- [ ] Business Studies
- [ ] Economics
- [ ] Geography
- [ ] History

For each subject:
- [ ] Subject header shows correct name
- [ ] All topics display
- [ ] Topic cards are clickable
- [ ] No "content not available" errors

## 5. Topic/Subtopic Pages (/subject/[slug]/[topic])
- [ ] Flashcards tab works
- [ ] Practice Questions tab works
- [ ] Recall Prompts tab works
- [ ] Content displays properly
- [ ] No duplicate content
- [ ] Mark schemes show correctly
- [ ] Flip/reveal answers work

Test at least 3 random subtopics from different subjects.

## 6. AI Test Generator (/ai-generator)
- [ ] Page loads without errors
- [ ] Subject dropdown populated
- [ ] Topic dropdown changes based on subject
- [ ] Difficulty slider works (1-10)
- [ ] Question count slider works (5-30)
- [ ] Generate button works
- [ ] Test generates successfully
- [ ] Questions display properly
- [ ] Answers/explanations show
- [ ] Can generate multiple tests

## 7. Pricing Page (/pricing)
- [ ] All 3 tiers display (Free, Pro, Premium)
- [ ] Prices show in EUR (€6.99, €11.99, etc.)
- [ ] Monthly/yearly toggle works
- [ ] Yearly discount shows correctly (33% off)
- [ ] Feature comparisons clear
- [ ] CTA buttons work
- [ ] Stripe checkout opens (test mode)

## 8. Dashboard (/dashboard)
- [ ] User stats display
- [ ] Recent activity shows
- [ ] Progress tracking works
- [ ] Quick links to subjects
- [ ] Subscription status shows

## 9. About Page (/about)
- [ ] Content loads properly
- [ ] Stats display (9 subjects, 473 topics, etc.)
- [ ] Mission/values show
- [ ] CTA to pricing works
- [ ] No lorem ipsum or placeholder text

## 10. FAQ Page (/faq)
- [ ] All FAQ categories display
- [ ] Accordions expand/collapse
- [ ] Pricing in EUR
- [ ] Contact support link works
- [ ] No outdated information

## 11. Contact Page (/contact)
- [ ] Email addresses correct (support@, hello@)
- [ ] FAQ link works
- [ ] Inline FAQs display
- [ ] CTA to support works

## 12. Legal Pages
### Privacy Policy (/privacy)
- [ ] Full content displays
- [ ] No placeholder text
- [ ] Dates are current

### Terms of Service (/terms)
- [ ] Full content displays
- [ ] Pricing in EUR (€100 liability cap)
- [ ] No placeholder text

## 13. Mobile Responsiveness
Test on mobile or resize browser:
- [ ] Homepage mobile-friendly
- [ ] Navigation menu (hamburger) works
- [ ] Subject cards stack properly
- [ ] Flashcards readable on mobile
- [ ] Pricing table mobile-responsive
- [ ] AI Generator usable on mobile

## 14. Performance & SEO
- [ ] Page load times under 3 seconds
- [ ] No console errors in browser
- [ ] No 404 errors
- [ ] Images load properly
- [ ] Favicon shows (if added)
- [ ] Meta tags present (check view source)

## 15. Links & Navigation
- [ ] All footer links work
- [ ] Header navigation works
- [ ] Internal links don't 404
- [ ] External links open in new tab (if applicable)
- [ ] Back button works properly

## 16. Content Quality
Sample check:
- [ ] Pick 5 random flashcards - check quality
- [ ] Pick 5 random practice questions - check quality
- [ ] Check for duplicate content
- [ ] Check for placeholder/mock data
- [ ] Verify mark schemes make sense

## 17. Stripe Integration (Test Mode)
- [ ] Can click "Subscribe" button
- [ ] Stripe checkout opens
- [ ] Can enter test card (4242 4242 4242 4242)
- [ ] Payment processes
- [ ] Redirected back to app
- [ ] Subscription status updates

## 18. Edge Cases
- [ ] What happens if user not signed in?
- [ ] What happens on wrong URL?
- [ ] 404 page exists and looks good?
- [ ] Loading states show properly
- [ ] Error messages are user-friendly

## 19. Browser Compatibility
Test in:
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge (if possible)

## 20. Final Checks
- [ ] No "localhost" URLs in production
- [ ] All environment variables set correctly
- [ ] Domain working (revisioncity.net)
- [ ] SSL certificate valid (https://)
- [ ] No broken images
- [ ] No JavaScript errors in console

---

## Critical Issues Found:
(List any blocking issues here)

## Minor Issues Found:
(List any non-critical issues here)

## Tested By: _____________
## Date: _____________
## Status: ⬜ PASS / ⬜ FAIL / ⬜ NEEDS FIXES
