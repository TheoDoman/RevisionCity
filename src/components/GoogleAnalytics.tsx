'use client'

import Script from 'next/script'
import { useState, useEffect } from 'react'

export default function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const [consented, setConsented] = useState(false)

  useEffect(() => {
    setConsented(localStorage.getItem('cookie_consent') === 'accepted')
  }, [])

  if (!consented) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  )
}
