import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useUser } from '@clerk/nextjs'

export function useSubscription() {
  const { isSignedIn } = useUser()
  const { subscriptionTier, setSubscriptionTier } = useAppStore()

  useEffect(() => {
    if (!isSignedIn) {
      setSubscriptionTier('free')
      return
    }

    // Fetch subscription status from API
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription/status')
        const data = await response.json()

        if (data.tier && data.tier !== subscriptionTier) {
          setSubscriptionTier(data.tier)
        }
      } catch (error) {
        console.error('Error fetching subscription:', error)
      }
    }

    fetchSubscription()
  }, [isSignedIn, setSubscriptionTier, subscriptionTier])

  return { subscriptionTier }
}
